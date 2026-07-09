import django_filters
from django.db.models import Q

from .models import Payment


class PaymentFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")
    status = django_filters.MultipleChoiceFilter(choices=Payment.PAYMENT_STATUS)
    payment_method = django_filters.ChoiceFilter(choices=Payment.PAYMENT_METHODS)
    month = django_filters.NumberFilter()
    year = django_filters.NumberFilter()
    payment_date_from = django_filters.DateFilter(field_name="payment_date", lookup_expr="gte")
    payment_date_to = django_filters.DateFilter(field_name="payment_date", lookup_expr="lte")
    due_date_from = django_filters.DateFilter(field_name="due_date", lookup_expr="gte")
    due_date_to = django_filters.DateFilter(field_name="due_date", lookup_expr="lte")
    min_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="gte")
    max_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="lte")
    member = django_filters.UUIDFilter(field_name="member__id")
    is_partial = django_filters.BooleanFilter(field_name="is_partial_payment")
    overdue = django_filters.BooleanFilter(method="overdue_filter")

    class Meta:
        model = Payment
        fields = [
            "status", "payment_method", "month", "year",
            "member", "is_partial",
        ]

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(receipt_number__icontains=value) |
            Q(member__full_name__icontains=value) |
            Q(member__member_id__icontains=value) |
            Q(payment_reference__icontains=value)
        )

    def overdue_filter(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(
                status="pending",
                due_date__lt=timezone.now().date(),
            )
        return queryset
