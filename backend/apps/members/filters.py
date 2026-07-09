import django_filters
from django.db.models import Q

from .models import Member


class MemberFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")
    status = django_filters.ChoiceFilter(choices=Member.STATUS_CHOICES)
    gender = django_filters.ChoiceFilter(choices=Member.GENDER_CHOICES)
    city = django_filters.CharFilter(lookup_expr="icontains")
    state = django_filters.CharFilter(lookup_expr="icontains")
    plan = django_filters.UUIDFilter(field_name="membership_plan__id")
    join_date_from = django_filters.DateFilter(field_name="join_date", lookup_expr="gte")
    join_date_to = django_filters.DateFilter(field_name="join_date", lookup_expr="lte")
    end_date_from = django_filters.DateFilter(field_name="membership_end_date", lookup_expr="gte")
    end_date_to = django_filters.DateFilter(field_name="membership_end_date", lookup_expr="lte")
    min_fee = django_filters.NumberFilter(field_name="monthly_fee", lookup_expr="gte")
    max_fee = django_filters.NumberFilter(field_name="monthly_fee", lookup_expr="lte")
    is_expiring_soon = django_filters.BooleanFilter(method="expiring_soon_filter")

    class Meta:
        model = Member
        fields = [
            "status", "gender", "city", "state", "plan",
        ]

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(full_name__icontains=value) |
            Q(member_id__icontains=value) |
            Q(phone_number__icontains=value) |
            Q(email__icontains=value)
        )

    def expiring_soon_filter(self, queryset, name, value):
        from django.utils import timezone
        from datetime import timedelta
        if value:
            threshold = timezone.now().date() + timedelta(days=7)
            return queryset.filter(
                membership_end_date__lte=threshold,
                membership_end_date__gte=timezone.now().date(),
            )
        return queryset
