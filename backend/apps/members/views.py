import io

import openpyxl
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrOwner, IsAdminOrReceptionist, IsStaffOrAdmin

from .filters import MemberFilter
from .models import Member
from .serializers import (
    MemberBulkActionSerializer,
    MemberCreateSerializer,
    MemberDetailSerializer,
    MemberExportSerializer,
    MemberListSerializer,
    MemberStatusSerializer,
    MemberUpdateSerializer,
)


class MemberViewSet(ModelViewSet):
    queryset = Member.objects.select_related("membership_plan").all()
    filterset_class = MemberFilter
    search_fields = [
        "full_name", "member_id", "phone_number",
        "email", "city", "state",
    ]
    ordering_fields = [
        "full_name", "member_id", "join_date",
        "monthly_fee", "status", "created_at",
        "membership_end_date",
    ]

    def get_serializer_class(self):
        if self.action == "list":
            return MemberListSerializer
        elif self.action == "create":
            return MemberCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return MemberUpdateSerializer
        elif self.action == "export":
            return MemberExportSerializer
        return MemberDetailSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.soft_delete()

    @action(detail=True, methods=["get", "patch"])
    def status(self, request, pk=None):
        member = self.get_object()
        if request.method == "GET":
            serializer = MemberDetailSerializer(member)
            return Response({
                "success": True,
                "message": "Member status retrieved",
                "data": serializer.data,
                "errors": [],
            }, status=status.HTTP_200_OK)
        serializer = MemberStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member.status = serializer.validated_data["status"]
        member.save()
        return Response({
            "success": True,
            "message": f"Member status updated to {member.get_status_display()}",
            "data": MemberDetailSerializer(member).data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        member = self.get_object()
        member.status = "suspended"
        member.save()
        return Response({
            "success": True,
            "message": "Member suspended successfully",
            "data": MemberDetailSerializer(member).data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        member = self.get_object()
        member.status = "active"
        member.save()
        return Response({
            "success": True,
            "message": "Member activated successfully",
            "data": MemberDetailSerializer(member).data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def renew(self, request, pk=None):
        from django.utils import timezone
        member = self.get_object()
        plan = request.data.get("membership_plan_id")
        if plan:
            from apps.plans.models import MembershipPlan
            try:
                membership_plan = MembershipPlan.objects.get(id=plan, is_active=True)
                member.membership_plan = membership_plan
                member.monthly_fee = membership_plan.effective_price
            except MembershipPlan.DoesNotExist:
                return Response({
                    "success": False,
                    "message": "Plan not found",
                    "data": None,
                    "errors": [{"field": "plan", "message": "Invalid plan"}],
                }, status=status.HTTP_400_BAD_REQUEST)
        member.membership_start_date = timezone.now().date()
        if member.membership_plan:
            member.membership_end_date = (
                timezone.now().date() + timezone.timedelta(days=member.membership_plan.duration_days)
            )
        member.status = "active"
        member.save()
        return Response({
            "success": True,
            "message": "Membership renewed successfully",
            "data": MemberDetailSerializer(member).data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def bulk_action(self, request):
        serializer = MemberBulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member_ids = serializer.validated_data["member_ids"]
        action = serializer.validated_data["action"]
        members = Member.objects.filter(id__in=member_ids)
        count = members.count()
        if action == "activate":
            members.update(status="active")
        elif action == "deactivate":
            members.update(status="inactive")
        elif action == "suspend":
            members.update(status="suspended")
        elif action == "delete":
            for member in members:
                member.soft_delete()
        return Response({
            "success": True,
            "message": f"{count} member(s) {action}d successfully",
            "data": {"count": count},
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def export(self, request):
        fmt = request.query_params.get("format", "csv")
        queryset = self.filter_queryset(self.get_queryset())
        if fmt == "excel":
            return self._export_excel(queryset)
        return self._export_csv(queryset)

    def _export_csv(self, queryset):
        import csv
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=members.csv"
        writer = csv.writer(response)
        writer.writerow([
            "Member ID", "Name", "Gender", "Phone", "Email",
            "City", "Plan", "Monthly Fee", "Status", "Join Date",
        ])
        for member in queryset:
            writer.writerow([
                member.member_id, member.full_name, member.gender,
                str(member.phone_number), member.email, member.city,
                member.membership_plan.name if member.membership_plan else "",
                str(member.monthly_fee), member.status,
                member.join_date.strftime("%Y-%m-%d"),
            ])
        return response

    def _export_excel(self, queryset):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Members"
        headers = [
            "Member ID", "Name", "Gender", "Age", "Phone", "Email",
            "Address", "City", "State", "Plan", "Monthly Fee",
            "Discount", "Status", "Join Date", "End Date",
        ]
        ws.append(headers)
        for member in queryset:
            ws.append([
                member.member_id, member.full_name, member.gender,
                member.age, str(member.phone_number), member.email,
                member.address_line1, member.city, member.state,
                member.membership_plan.name if member.membership_plan else "",
                float(member.monthly_fee), float(member.discount),
                member.status,
                member.join_date.strftime("%Y-%m-%d") if member.join_date else "",
                member.membership_end_date.strftime("%Y-%m-%d") if member.membership_end_date else "",
            ])
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        response = HttpResponse(
            output.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=members.xlsx"
        return response

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total = Member.objects.filter(is_deleted=False).count()
        active = Member.objects.filter(is_deleted=False, status="active").count()
        expired = Member.objects.filter(is_deleted=False, status="expired").count()
        suspended = Member.objects.filter(is_deleted=False, status="suspended").count()
        return Response({
            "success": True,
            "message": "Member statistics",
            "data": {
                "total": total,
                "active": active,
                "expired": expired,
                "suspended": suspended,
            },
            "errors": [],
        }, status=status.HTTP_200_OK)
