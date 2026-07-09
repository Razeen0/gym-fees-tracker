from django.db import models


class GymSettings(models.Model):
    gym_name = models.CharField(max_length=255, default="My Gym")
    gym_logo = models.ImageField(upload_to="settings/", blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="India")
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    currency = models.CharField(max_length=10, default="INR")
    currency_symbol = models.CharField(max_length=5, default="₹")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_name = models.CharField(max_length=100, default="GST")
    receipt_footer = models.TextField(blank=True)
    invoice_prefix = models.CharField(max_length=20, default="RCP")
    late_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)
    due_reminder_days = models.PositiveIntegerField(default=3)
    enable_email_notifications = models.BooleanField(default=False)
    enable_sms_notifications = models.BooleanField(default=False)
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gym_settings"
        verbose_name = "Gym Setting"
        verbose_name_plural = "Gym Settings"

    def __str__(self):
        return self.gym_name

    def save(self, *args, **kwargs):
        if not GymSettings.objects.filter(id=self.id).exists() and not self.id:
            pass
        super().save(*args, **kwargs)


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("login", "Login"),
        ("logout", "Logout"),
        ("payment", "Payment"),
        ("export", "Export"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "audit_logs"
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "action"]),
            models.Index(fields=["model_name", "object_id"]),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.model_name} at {self.created_at}"
