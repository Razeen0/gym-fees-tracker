from rest_framework import serializers

from .models import AuditLog, GymSettings


class GymSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GymSettings
        fields = [
            "id", "gym_name", "gym_logo",
            "address_line1", "address_line2", "city",
            "state", "postal_code", "country",
            "phone_number", "email", "website",
            "currency", "currency_symbol", "timezone",
            "tax_percentage", "tax_name",
            "receipt_footer", "invoice_prefix",
            "late_fee_percentage", "due_reminder_days",
            "enable_email_notifications", "enable_sms_notifications",
            "smtp_host", "smtp_port", "smtp_username", "smtp_password",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_gym_logo(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 5MB")
        return value


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id", "user", "user_name", "action",
            "model_name", "object_id", "details",
            "ip_address", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
