from django.contrib import admin

from .models import AuditLog, GymSettings


@admin.register(GymSettings)
class GymSettingsAdmin(admin.ModelAdmin):
    list_display = ["gym_name", "currency", "timezone", "tax_percentage", "updated_at"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["user", "action", "model_name", "object_id", "created_at"]
    list_filter = ["action", "model_name"]
    search_fields = ["user__full_name", "model_name", "object_id"]
    readonly_fields = ["user", "action", "model_name", "object_id", "details", "ip_address", "created_at"]
