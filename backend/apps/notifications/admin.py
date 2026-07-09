from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["subject", "notification_type", "channel", "status", "member", "created_at"]
    list_filter = ["notification_type", "channel", "status"]
    search_fields = ["subject", "message"]
