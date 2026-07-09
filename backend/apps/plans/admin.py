from django.contrib import admin

from .models import MembershipPlan


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "duration", "price", "discounted_price", "is_popular", "is_active", "sort_order"]
    list_filter = ["duration", "is_active", "is_popular"]
    search_fields = ["name", "description"]
    ordering = ["sort_order", "name"]
    list_editable = ["is_active", "is_popular", "sort_order"]
