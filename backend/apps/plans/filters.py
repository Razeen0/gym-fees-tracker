import django_filters

from .models import MembershipPlan


class MembershipPlanFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    duration = django_filters.ChoiceFilter(choices=MembershipPlan.DURATION_CHOICES)
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    is_active = django_filters.BooleanFilter()
    is_popular = django_filters.BooleanFilter()

    class Meta:
        model = MembershipPlan
        fields = ["name", "duration", "is_active", "is_popular"]
