from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrOwner, IsAdminOrReceptionist

from .filters import PaymentFilter
from .models import Payment, PaymentHistory
from .serializers import (
    PaymentBulkCreateSerializer,
    PaymentCreateSerializer,
    PaymentDetailSerializer,
    PaymentHistorySerializer,
    PaymentListSerializer,
    PaymentStatusUpdateSerializer,
    PaymentSummarySerializer,
    PaymentUpdateSerializer,
)


class PaymentViewSet(ModelViewSet):
    queryset = Payment.objects.select_related(
        "member", "paid_by"
    ).prefetch_related("history").all()
    filterset_class = PaymentFilter
    search_fields = [
        "receipt_number", "member__full_name",
        "member__member_id", "payment_reference",
        "remarks",
    ]
    ordering_fields = [
        "payment_date", "due_date", "amount",
        "total_amount", "amount_paid", "status",
        "created_at", "month", "year",
    ]

    def get_serializer_class(self):
        if self.action == "list":
            return PaymentListSerializer
        elif self.action == "create":
            return PaymentCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return PaymentUpdateSerializer
        return PaymentDetailSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(paid_by=self.request.user)

    def perform_destroy(self, instance):
        self._record_history(instance, "cancelled", notes="Payment deleted")
        instance.soft_delete()

    def _record_history(self, payment, new_status, notes=""):
        old_status = payment.status
        old_amount = payment.amount_paid

        payment.status = new_status
        payment.save()

        PaymentHistory.objects.create(
            payment=payment,
            changed_by=self.request.user if self.request.user.is_authenticated else None,
            old_status=old_status,
            new_status=new_status,
            old_amount=old_amount,
            new_amount=payment.amount_paid,
            notes=notes,
        )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        payment = self.get_object()
        serializer = PaymentStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_status = payment.status
        payment.status = serializer.validated_data["status"]
        payment.save()
        PaymentHistory.objects.create(
            payment=payment,
            changed_by=request.user,
            old_status=old_status,
            new_status=payment.status,
            notes=serializer.validated_data.get("notes", ""),
        )
        return Response({
            "success": True,
            "message": f"Payment status updated to {payment.get_status_display()}",
            "data": PaymentDetailSerializer(payment).data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        payment = self.get_object()
        history = PaymentHistory.objects.filter(payment=payment).select_related("changed_by")
        serializer = PaymentHistorySerializer(history, many=True)
        return Response({
            "success": True,
            "message": "Payment history retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        month = request.query_params.get("month", timezone.now().month)
        year = request.query_params.get("year", timezone.now().year)
        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError):
            month = timezone.now().month
            year = timezone.now().year

        payments = Payment.objects.filter(
            month=month, year=year, is_deleted=False
        )

        summary = payments.aggregate(
            total_collected=Sum("amount_paid", filter=Q(status="paid")),
            total_pending=Sum("total_amount", filter=Q(status="pending")),
            total_overdue=Sum("total_amount", filter=Q(status="overdue")),
            total_count=Count("id"),
            paid_count=Count("id", filter=Q(status="paid")),
            pending_count=Count("id", filter=Q(status="pending")),
            overdue_count=Count("id", filter=Q(status="overdue")),
        )

        serializer = PaymentSummarySerializer(summary)
        return Response({
            "success": True,
            "message": "Payment summary retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        serializer = PaymentBulkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member_ids = serializer.validated_data["member_ids"]
        month = serializer.validated_data["month"]
        year = serializer.validated_data["year"]
        due_date = serializer.validated_data["due_date"]
        remarks = serializer.validated_data.get("remarks", "")

        from apps.members.models import Member
        members = Member.objects.filter(id__in=member_ids, is_deleted=False)

        created = 0
        skipped = 0
        payments = []

        for member in members:
            existing = Payment.objects.filter(
                member=member, month=month, year=year, is_deleted=False
            ).exists()
            if existing:
                skipped += 1
                continue

            late_fee = Decimal("0")
            if timezone.now().date() > due_date:
                late_fee = member.monthly_fee * Decimal("0.02")

            discount_amount = Decimal("0")
            if member.discount_type == "percentage":
                discount_amount = member.monthly_fee * (member.discount / 100)
            else:
                discount_amount = Decimal(str(member.discount))

            payment = Payment(
                member=member,
                amount=member.monthly_fee,
                due_amount=member.effective_fee,
                late_fee=late_fee,
                discount_applied=discount_amount,
                total_amount=member.effective_fee + late_fee,
                due_date=due_date,
                month=month,
                year=year,
                status="pending",
                remarks=remarks if remarks else f"Auto-generated for {month}/{year}",
                paid_by=request.user,
            )
            payment.save()
            payments.append(payment)
            created += 1

        return Response({
            "success": True,
            "message": f"Created {created} payment(s), {skipped} skipped",
            "data": {
                "created": created,
                "skipped": skipped,
                "payments": PaymentListSerializer(payments, many=True).data,
            },
            "errors": [],
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        today = timezone.now().date()
        payments = self.get_queryset().filter(
            status="pending",
            due_date__lt=today,
        ).exclude(
            status__in=["paid", "cancelled", "refunded"],
        )
        payments.update(status="overdue")
        serializer = PaymentListSerializer(payments, many=True)
        return Response({
            "success": True,
            "message": f"{payments.count()} payment(s) marked as overdue",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def member_payments(self, request):
        member_id = request.query_params.get("member_id")
        if not member_id:
            return Response({
                "success": False,
                "message": "member_id is required",
                "data": None,
                "errors": [{"field": "member_id", "message": "This field is required"}],
            }, status=status.HTTP_400_BAD_REQUEST)
        payments = self.get_queryset().filter(member_id=member_id)
        serializer = PaymentListSerializer(payments, many=True)
        return Response({
            "success": True,
            "message": "Member payments retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def print_receipt(self, request):
        payment_id = request.query_params.get("payment_id")
        if not payment_id:
            return Response({
                "success": False,
                "message": "payment_id is required",
                "data": None,
                "errors": [],
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            payment = Payment.objects.select_related("member", "paid_by").get(
                id=payment_id, is_deleted=False
            )
        except Payment.DoesNotExist:
            return Response({
                "success": False,
                "message": "Payment not found",
                "data": None,
                "errors": [],
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = PaymentDetailSerializer(payment)
        return Response({
            "success": True,
            "message": "Receipt data retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)
