from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrOwner

from .models import Notification
from .serializers import NotificationCreateSerializer, NotificationSerializer


class NotificationViewSet(ModelViewSet):
    queryset = Notification.objects.select_related("member").all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    search_fields = ["subject", "message", "notification_type"]
    ordering_fields = ["-created_at", "status"]

    def get_queryset(self):
        return Notification.objects.select_related("member").all()[:50]

    @action(detail=False, methods=["post"])
    def send_reminders(self, request):
        from django.utils import timezone
        from datetime import timedelta

        from apps.members.models import Member
        from apps.payments.models import Payment

        today = timezone.now().date()
        settings_data = request.data or {}

        due_in_days = settings_data.get("due_in_days", 3)
        notifications_created = 0

        members_due = Member.objects.filter(
            is_deleted=False,
            status="active",
        ).exclude(
            payments__month=today.month,
            payments__year=today.year,
            payments__status__in=["paid", "cancelled"],
        )

        for member in members_due:
            Notification.objects.create(
                member=member,
                notification_type="payment_due",
                channel="in_app",
                subject="Payment Due Reminder",
                message=(
                    f"Dear {member.full_name}, your payment of ₹{member.effective_fee} "
                    f"for {today.strftime('%B %Y')} is due. Please pay before the due date."
                ),
                metadata={"month": today.month, "year": today.year},
            )
            notifications_created += 1

        expiring_members = Member.objects.filter(
            is_deleted=False,
            status="active",
            membership_end_date__lte=today + timedelta(days=7),
            membership_end_date__gte=today,
        )

        for member in expiring_members:
            Notification.objects.create(
                member=member,
                notification_type="membership_expiry",
                channel="in_app",
                subject="Membership Expiring Soon",
                message=(
                    f"Dear {member.full_name}, your membership will expire on "
                    f"{member.membership_end_date}. Please renew to continue enjoying our services."
                ),
                metadata={"end_date": str(member.membership_end_date)},
            )
            notifications_created += 1

        return Response({
            "success": True,
            "message": f"Created {notifications_created} notification(s)",
            "data": {"created": notifications_created},
            "errors": [],
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def my_notifications(self, request):
        notifications = Notification.objects.filter(
            member__isnull=False,
        ).order_by("-created_at")[:20]
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            "success": True,
            "message": "Notifications retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_active = False
        notification.save()
        return Response({
            "success": True,
            "message": "Notification marked as read",
            "data": NotificationSerializer(notification).data,
            "errors": [],
        }, status=status.HTTP_200_OK)
