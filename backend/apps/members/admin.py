from django.contrib import admin

from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ["member_id", "full_name", "gender", "phone_number", "status", "membership_plan", "join_date"]
    list_filter = ["status", "gender", "membership_plan"]
    search_fields = ["full_name", "member_id", "phone_number", "email"]
    ordering = ["-created_at"]
    readonly_fields = ["member_id", "join_date"]
    list_editable = ["status"]
