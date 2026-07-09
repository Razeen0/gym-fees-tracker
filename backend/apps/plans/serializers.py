from rest_framework import serializers

from .models import MembershipPlan


class MembershipPlanSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = MembershipPlan
        fields = [
            "id", "name", "duration", "duration_days", "price",
            "discounted_price", "effective_price", "benefits",
            "description", "is_popular", "is_active", "max_members",
            "sort_order", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "duration_days", "created_at", "updated_at"]

    def validate(self, data):
        if data.get("discounted_price") and data.get("price"):
            if data["discounted_price"] >= data["price"]:
                raise serializers.ValidationError(
                    "Discounted price must be less than the original price"
                )
        return data


class MembershipPlanListSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = MembershipPlan
        fields = [
            "id", "name", "duration", "duration_days", "price",
            "discounted_price", "effective_price", "is_popular",
            "is_active", "member_count", "sort_order",
        ]
