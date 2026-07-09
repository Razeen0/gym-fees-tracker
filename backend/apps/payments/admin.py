from django.contrib import admin

from .models import Payment, PaymentHistory


class PaymentHistoryInline(admin.TabularInline):
    model = PaymentHistory
    extra = 0
    readonly_fields = ["old_status", "new_status", "old_amount", "new_amount", "changed_by", "created_at"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["receipt_number", "member", "amount", "status", "payment_method", "payment_date", "month", "year"]
    list_filter = ["status", "payment_method", "month", "year"]
    search_fields = ["receipt_number", "member__full_name", "member__member_id"]
    ordering = ["-payment_date"]
    readonly_fields = ["receipt_number", "total_amount", "balance"]
    inlines = [PaymentHistoryInline]


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ["payment", "old_status", "new_status", "changed_by", "created_at"]
    list_filter = ["old_status", "new_status"]
