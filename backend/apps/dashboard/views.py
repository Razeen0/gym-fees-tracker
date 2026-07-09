from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.members.models import Member
from apps.payments.models import Payment


class DashboardViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def overview(self, request):
        today = timezone.now().date()
        current_month = today.month
        current_year = today.year

        total_members = Member.objects.filter(is_deleted=False).count()
        active_members = Member.objects.filter(is_deleted=False, status="active").count()
        expired_members = Member.objects.filter(is_deleted=False, status="expired").count()
        suspended_members = Member.objects.filter(is_deleted=False, status="suspended").count()

        members_expiring_soon = Member.objects.filter(
            is_deleted=False,
            status="active",
            membership_end_date__lte=today + timedelta(days=7),
            membership_end_date__gte=today,
        ).count()

        payments = Payment.objects.filter(
            month=current_month,
            year=current_year,
            is_deleted=False,
        )

        payment_stats = payments.aggregate(
            total_amount=Sum("total_amount"),
            total_collected=Sum("amount_paid", filter=Q(status="paid")),
            pending_amount=Sum("total_amount", filter=Q(status="pending")),
            overdue_amount=Sum("total_amount", filter=Q(status="overdue")),
        )

        today_collections = Payment.objects.filter(
            payment_date=today,
            status="paid",
            is_deleted=False,
        ).aggregate(
            today_total=Sum("amount_paid"),
            today_count=Count("id"),
        )

        pending_payments = Payment.objects.filter(
            status__in=["pending", "overdue"],
            is_deleted=False,
        ).count()

        total_revenue_year = Payment.objects.filter(
            payment_date__year=current_year,
            status="paid",
            is_deleted=False,
        ).aggregate(total=Sum("amount_paid"))

        return Response({
            "success": True,
            "message": "Dashboard overview",
            "data": {
                "members": {
                    "total": total_members,
                    "active": active_members,
                    "expired": expired_members,
                    "suspended": suspended_members,
                    "expiring_soon": members_expiring_soon,
                },
                "payments": {
                    "total_amount": payment_stats.get("total_amount") or 0,
                    "total_collected": payment_stats.get("total_collected") or 0,
                    "pending_amount": payment_stats.get("pending_amount") or 0,
                    "overdue_amount": payment_stats.get("overdue_amount") or 0,
                    "pending_count": pending_payments,
                },
                "today": {
                    "collections": today_collections.get("today_total") or 0,
                    "collection_count": today_collections.get("today_count") or 0,
                    "due_amount": Payment.objects.filter(
                        due_date=today,
                        is_deleted=False,
                    ).exclude(status="paid").aggregate(
                        total=Sum("total_amount")
                    ).get("total") or 0,
                },
                "monthly_revenue": payment_stats.get("total_collected") or 0,
                "yearly_revenue": total_revenue_year.get("total") or 0,
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def revenue_chart(self, request):
        year = request.query_params.get("year", timezone.now().year)
        try:
            year = int(year)
        except ValueError:
            year = timezone.now().year

        monthly_data = []
        for month in range(1, 13):
            payments = Payment.objects.filter(
                month=month, year=year, is_deleted=False
            )
            stats = payments.aggregate(
                collected=Sum("amount_paid", filter=Q(status="paid")),
                pending=Sum("total_amount", filter=Q(status="pending")),
            )
            monthly_data.append({
                "month": month,
                "collected": float(stats.get("collected") or 0),
                "pending": float(stats.get("pending") or 0),
            })

        return Response({
            "success": True,
            "message": "Revenue chart data",
            "data": monthly_data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def recent_payments(self, request):
        recent_payments = Payment.objects.select_related("member", "paid_by").filter(
            is_deleted=False,
        ).order_by("-payment_date", "-created_at")[:10]

        data = []
        for p in recent_payments:
            data.append({
                "id": p.id,
                "receipt_number": p.receipt_number,
                "member_name": p.member.full_name,
                "member_id": p.member.member_id,
                "amount": float(p.amount_paid),
                "status": p.status,
                "payment_method": p.payment_method,
                "payment_date": p.payment_date.isoformat(),
                "collected_by": p.paid_by.full_name if p.paid_by else None,
            })

        return Response({
            "success": True,
            "message": "Recent payments",
            "data": data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def membership_growth(self, request):
        year = request.query_params.get("year", timezone.now().year)
        try:
            year = int(year)
        except ValueError:
            year = timezone.now().year

        monthly_data = []
        for month in range(1, 13):
            count = Member.objects.filter(
                is_deleted=False,
                join_date__year=year,
                join_date__month=month,
            ).count()
            monthly_data.append({
                "month": month,
                "new_members": count,
            })

        return Response({
            "success": True,
            "message": "Membership growth data",
            "data": monthly_data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def payment_method_distribution(self, request):
        month = request.query_params.get("month", timezone.now().month)
        year = request.query_params.get("year", timezone.now().year)
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            month = timezone.now().month
            year = timezone.now().year

        distribution = Payment.objects.filter(
            month=month, year=year, status="paid", is_deleted=False,
        ).values("payment_method").annotate(
            total=Sum("amount_paid"),
            count=Count("id"),
        ).order_by("-total")

        data = [
            {
                "method": item["payment_method"],
                "total": float(item["total"] or 0),
                "count": item["count"],
            }
            for item in distribution
        ]

        return Response({
            "success": True,
            "message": "Payment method distribution",
            "data": data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def upcoming_renewals(self, request):
        today = timezone.now().date()
        renewals = Member.objects.filter(
            is_deleted=False,
            status="active",
            membership_end_date__gte=today,
            membership_end_date__lte=today + timedelta(days=30),
        ).select_related("membership_plan").order_by("membership_end_date")[:20]

        data = []
        for m in renewals:
            data.append({
                "id": m.id,
                "member_id": m.member_id,
                "full_name": m.full_name,
                "phone_number": str(m.phone_number),
                "plan_name": m.membership_plan.name if m.membership_plan else None,
                "membership_end_date": m.membership_end_date.isoformat(),
                "days_remaining": (m.membership_end_date - today).days,
            })

        return Response({
            "success": True,
            "message": "Upcoming renewals",
            "data": data,
            "errors": [],
        }, status=status.HTTP_200_OK)
