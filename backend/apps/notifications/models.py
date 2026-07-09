from django.db import models

from apps.common.models import BaseModel


class Notification(BaseModel):
    TYPE_CHOICES = [
        ("payment_due", "Payment Due"),
        ("payment_overdue", "Payment Overdue"),
        ("payment_received", "Payment Received"),
        ("membership_expiry", "Membership Expiry"),
        ("membership_renewed", "Membership Renewed"),
        ("member_suspended", "Member Suspended"),
        ("system", "System Notification"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("sms", "SMS"),
        ("whatsapp", "WhatsApp"),
        ("in_app", "In App"),
    ]

    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="in_app")
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "notifications"
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["notification_type", "status"]),
            models.Index(fields=["member", "status"]),
        ]

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.subject}"
