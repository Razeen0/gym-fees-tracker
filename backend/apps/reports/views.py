import csv
import io
from datetime import datetime, timedelta

import openpyxl
from django.db.models import Count, OuterRef, Q, Subquery, Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.members.models import Member
from apps.payments.models import Payment


class ReportViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_date_range(self, request):
        today = timezone.now().date()
        month = request.query_params.get("month", today.month)
        year = request.query_params.get("year", today.year)
        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError):
            month = today.month
            year = today.year
        return month, year

    @action(detail=False, methods=["get"])
    def monthly_revenue(self, request):
        month, year = self._get_date_range(request)
        payments = Payment.objects.filter(
            month=month, year=year, is_deleted=False
        )
        stats = payments.aggregate(
            total_collected=Sum("amount_paid", filter=Q(status="paid")),
            total_pending=Sum("total_amount", filter=Q(status="pending")),
            total_overdue=Sum("total_amount", filter=Q(status="overdue")),
            paid_count=Count("id", filter=Q(status="paid")),
            pending_count=Count("id", filter=Q(status="pending")),
            overdue_count=Count("id", filter=Q(status="overdue")),
            total_transactions=Count("id"),
        )

        payment_methods = payments.filter(
            status="paid"
        ).values("payment_method").annotate(
            total=Sum("amount_paid"),
            count=Count("id"),
        )

        return Response({
            "success": True,
            "message": f"Monthly revenue report for {month}/{year}",
            "data": {
                "month": month,
                "year": year,
                "summary": {
                    "total_collected": float(stats.get("total_collected") or 0),
                    "total_pending": float(stats.get("total_pending") or 0),
                    "total_overdue": float(stats.get("total_overdue") or 0),
                    "paid_count": stats.get("paid_count") or 0,
                    "pending_count": stats.get("pending_count") or 0,
                    "overdue_count": stats.get("overdue_count") or 0,
                    "total_transactions": stats.get("total_transactions") or 0,
                },
                "payment_methods": [
                    {
                        "method": p["payment_method"],
                        "total": float(p["total"] or 0),
                        "count": p["count"],
                    }
                    for p in payment_methods
                ],
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def yearly_revenue(self, request):
        year = request.query_params.get("year", timezone.now().year)
        try:
            year = int(year)
        except ValueError:
            year = timezone.now().year

        monthly_data = []
        for m in range(1, 13):
            payments = Payment.objects.filter(
                month=m, year=year, is_deleted=False
            )
            stats = payments.aggregate(
                collected=Sum("amount_paid", filter=Q(status="paid")),
                pending=Sum("total_amount", filter=Q(status="pending")),
                count=Count("id", filter=Q(status="paid")),
            )
            monthly_data.append({
                "month": m,
                "collected": float(stats.get("collected") or 0),
                "pending": float(stats.get("pending") or 0),
                "transactions": stats.get("count") or 0,
            })

        total_stats = Payment.objects.filter(
            payment_date__year=year, is_deleted=False
        ).aggregate(
            total_revenue=Sum("amount_paid", filter=Q(status="paid")),
            total_pending=Sum("total_amount", filter=Q(status__in=["pending", "overdue"])),
            total_transactions=Count("id", filter=Q(status="paid")),
        )

        return Response({
            "success": True,
            "message": f"Yearly revenue report for {year}",
            "data": {
                "year": year,
                "monthly_data": monthly_data,
                "summary": {
                    "total_revenue": float(total_stats.get("total_revenue") or 0),
                    "total_pending": float(total_stats.get("total_pending") or 0),
                    "total_transactions": total_stats.get("total_transactions") or 0,
                },
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def pending_report(self, request):
        month, year = self._get_date_range(request)
        payments = Payment.objects.filter(
            Q(status="pending") | Q(status="overdue"),
            month=month,
            year=year,
            is_deleted=False,
        ).select_related("member").order_by("member__full_name")

        data = []
        for p in payments:
            data.append({
                "id": p.id,
                "member_name": p.member.full_name,
                "member_id": p.member.member_id,
                "phone": str(p.member.phone_number),
                "amount": float(p.total_amount),
                "due_date": p.due_date.isoformat(),
                "status": p.status,
                "days_overdue": (timezone.now().date() - p.due_date).days if p.due_date < timezone.now().date() else 0,
            })

        total = sum(p["amount"] for p in data)
        return Response({
            "success": True,
            "message": f"Pending report for {month}/{year}",
            "data": {
                "month": month,
                "year": year,
                "total_pending": len(data),
                "total_amount": total,
                "payments": data,
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def membership_report(self, request):
        total = Member.objects.filter(is_deleted=False).count()
        status_counts = Member.objects.filter(is_deleted=False).values("status").annotate(
            count=Count("id")
        )
        plan_distribution = Member.objects.filter(
            is_deleted=False, membership_plan__isnull=False
        ).values(
            "membership_plan__name"
        ).annotate(
            count=Count("id")
        ).order_by("-count")

        gender_distribution = Member.objects.filter(
            is_deleted=False
        ).values("gender").annotate(count=Count("id"))

        return Response({
            "success": True,
            "message": "Membership report",
            "data": {
                "total_members": total,
                "by_status": {s["status"]: s["count"] for s in status_counts},
                "by_plan": [
                    {"plan": p["membership_plan__name"], "count": p["count"]}
                    for p in plan_distribution
                ],
                "by_gender": {g["gender"]: g["count"] for g in gender_distribution},
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def expired_members(self, request):
        today = timezone.now().date()
        members = Member.objects.filter(
            is_deleted=False,
            membership_end_date__lt=today,
        ).exclude(status="expired")
        members.update(status="expired")

        expired = Member.objects.filter(
            is_deleted=False,
            membership_end_date__lt=today,
        ).select_related("membership_plan").order_by("-membership_end_date")

        data = []
        for m in expired:
            data.append({
                "id": m.id,
                "member_id": m.member_id,
                "full_name": m.full_name,
                "phone": str(m.phone_number),
                "plan": m.membership_plan.name if m.membership_plan else None,
                "end_date": m.membership_end_date.isoformat(),
                "days_expired": (today - m.membership_end_date).days,
            })

        return Response({
            "success": True,
            "message": "Expired members report",
            "data": {
                "total_expired": len(data),
                "members": data,
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def collection_report(self, request):
        month, year = self._get_date_range(request)
        payments = Payment.objects.filter(
            status="paid",
            month=month,
            year=year,
            is_deleted=False,
        ).select_related("member", "paid_by").order_by("-payment_date")

        data = []
        for p in payments:
            data.append({
                "receipt": p.receipt_number,
                "member_name": p.member.full_name,
                "member_id": p.member.member_id,
                "amount": float(p.amount_paid),
                "method": p.payment_method,
                "date": p.payment_date.isoformat(),
                "collected_by": p.paid_by.full_name if p.paid_by else None,
            })

        total = sum(d["amount"] for d in data)
        return Response({
            "success": True,
            "message": f"Collection report for {month}/{year}",
            "data": {
                "month": month,
                "year": year,
                "total_collected": total,
                "total_transactions": len(data),
                "collections": data,
            },
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def export(self, request):
        report_type = request.query_params.get("type", "payment")
        fmt = request.query_params.get("format", "csv")
        month, year = self._get_date_range(request)

        if report_type == "payment":
            return self._export_payments(fmt, month, year)
        elif report_type == "member":
            return self._export_members(fmt)
        elif report_type == "collection":
            return self._export_collections(fmt, month, year)
        return Response({
            "success": False,
            "message": "Invalid report type",
            "data": None,
            "errors": [],
        }, status=status.HTTP_400_BAD_REQUEST)

    def _export_payments(self, fmt, month, year):
        payments = Payment.objects.filter(
            month=month, year=year, is_deleted=False
        ).select_related("member").order_by("member__full_name")

        if fmt == "excel":
            return self._write_excel(
                "Payment_Report",
                ["Receipt", "Member", "Member ID", "Amount", "Paid", "Balance", "Status", "Method", "Date"],
                [
                    [p.receipt_number, p.member.full_name, p.member.member_id,
                     float(p.total_amount), float(p.amount_paid), float(p.balance),
                     p.get_status_display(), p.get_payment_method_display(),
                     p.payment_date.strftime("%Y-%m-%d")]
                    for p in payments
                ],
                f"Payment_Report_{month}_{year}.xlsx",
            )
        return self._write_csv(
            ["Receipt", "Member", "Member ID", "Amount", "Paid", "Balance", "Status", "Method", "Date"],
            [
                [p.receipt_number, p.member.full_name, p.member.member_id,
                 float(p.total_amount), float(p.amount_paid), float(p.balance),
                 p.get_status_display(), p.get_payment_method_display(),
                 p.payment_date.strftime("%Y-%m-%d")]
                for p in payments
            ],
            f"Payment_Report_{month}_{year}.csv",
        )

    def _export_members(self, fmt):
        members = Member.objects.filter(is_deleted=False).select_related("membership_plan")
        if fmt == "excel":
            return self._write_excel(
                "Member_Report",
                ["Member ID", "Name", "Gender", "Phone", "Email", "Plan", "Fee", "Status", "Join Date", "End Date"],
                [
                    [m.member_id, m.full_name, m.gender, str(m.phone_number),
                     m.email, m.membership_plan.name if m.membership_plan else "",
                     float(m.monthly_fee), m.status,
                     m.join_date.strftime("%Y-%m-%d") if m.join_date else "",
                     m.membership_end_date.strftime("%Y-%m-%d") if m.membership_end_date else ""]
                    for m in members
                ],
                "Member_Report.xlsx",
            )
        return self._write_csv(
            ["Member ID", "Name", "Gender", "Phone", "Email", "Plan", "Fee", "Status", "Join Date", "End Date"],
            [
                [m.member_id, m.full_name, m.gender, str(m.phone_number),
                 m.email, m.membership_plan.name if m.membership_plan else "",
                 float(m.monthly_fee), m.status,
                 m.join_date.strftime("%Y-%m-%d") if m.join_date else "",
                 m.membership_end_date.strftime("%Y-%m-%d") if m.membership_end_date else ""]
                for m in members
            ],
            "Member_Report.csv",
        )

    def _export_collections(self, fmt, month, year):
        payments = Payment.objects.filter(
            status="paid", month=month, year=year, is_deleted=False
        ).select_related("member", "paid_by")
        if fmt == "excel":
            return self._write_excel(
                "Collection_Report",
                ["Receipt", "Member", "ID", "Amount", "Method", "Date", "Collected By"],
                [
                    [p.receipt_number, p.member.full_name, p.member.member_id,
                     float(p.amount_paid), p.get_payment_method_display(),
                     p.payment_date.strftime("%Y-%m-%d"),
                     p.paid_by.full_name if p.paid_by else ""]
                    for p in payments
                ],
                f"Collection_Report_{month}_{year}.xlsx",
            )
        return self._write_csv(
            ["Receipt", "Member", "ID", "Amount", "Method", "Date", "Collected By"],
            [
                [p.receipt_number, p.member.full_name, p.member.member_id,
                 float(p.amount_paid), p.get_payment_method_display(),
                 p.payment_date.strftime("%Y-%m-%d"),
                 p.paid_by.full_name if p.paid_by else ""]
                for p in payments
            ],
            f"Collection_Report_{month}_{year}.csv",
        )

    def _write_csv(self, headers, rows, filename):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f"attachment; filename={filename}"
        writer = csv.writer(response)
        writer.writerow(headers)
        writer.writerows(rows)
        return response

    def _write_excel(self, title, headers, rows, filename):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = title
        ws.append(headers)
        for row in rows:
            ws.append(row)
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        response = HttpResponse(
            output.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f"attachment; filename={filename}"
        return response
