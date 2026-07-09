from rest_framework import serializers

from apps.plans.serializers import MembershipPlanSerializer

from .models import Member


class MemberListSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="membership_plan.name", read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)

    class Meta:
        model = Member
        fields = [
            "id", "member_id", "full_name", "profile_photo",
            "gender", "phone_number", "email",
            "membership_plan", "plan_name", "monthly_fee",
            "status", "join_date", "membership_end_date",
            "days_until_expiry",
        ]


class MemberDetailSerializer(serializers.ModelSerializer):
    plan_details = MembershipPlanSerializer(source="membership_plan", read_only=True)
    effective_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    age_display = serializers.SerializerMethodField()
    days_until_expiry = serializers.IntegerField(read_only=True)
    is_membership_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Member
        fields = [
            "id", "member_id", "full_name", "profile_photo",
            "gender", "date_of_birth", "age", "age_display",
            "phone_number", "email",
            "address_line1", "address_line2", "city", "state",
            "postal_code", "country",
            "emergency_contact_name", "emergency_contact_phone",
            "join_date", "membership_plan", "plan_details",
            "membership_start_date", "membership_end_date",
            "monthly_fee", "discount", "discount_type", "effective_fee",
            "days_until_expiry", "is_membership_expired",
            "status", "notes", "photo_id_proof",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "member_id", "join_date", "created_at", "updated_at"]

    def get_age_display(self, obj):
        if obj.date_of_birth:
            return obj.date_of_birth.strftime("%d-%m-%Y")
        return None


class MemberCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "full_name", "profile_photo", "gender", "date_of_birth",
            "phone_number", "email",
            "address_line1", "address_line2", "city", "state",
            "postal_code", "country",
            "emergency_contact_name", "emergency_contact_phone",
            "membership_plan", "membership_start_date", "membership_end_date",
            "monthly_fee", "discount", "discount_type",
            "status", "notes", "photo_id_proof",
        ]

    def validate(self, data):
        monthly_fee = data.get("monthly_fee", 0)
        discount = data.get("discount", 0)
        discount_type = data.get("discount_type", "percentage")

        if discount_type == "percentage" and discount > 100:
            raise serializers.ValidationError("Percentage discount cannot exceed 100%")
        if discount_type == "fixed" and discount > monthly_fee:
            raise serializers.ValidationError("Fixed discount cannot exceed the monthly fee")

        return data


class MemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "full_name", "profile_photo", "gender", "date_of_birth",
            "phone_number", "email",
            "address_line1", "address_line2", "city", "state",
            "postal_code", "country",
            "emergency_contact_name", "emergency_contact_phone",
            "membership_plan", "membership_start_date", "membership_end_date",
            "monthly_fee", "discount", "discount_type",
            "notes", "photo_id_proof",
        ]

    def validate(self, data):
        monthly_fee = data.get("monthly_fee") or self.instance.monthly_fee
        discount = data.get("discount") or self.instance.discount
        discount_type = data.get("discount_type") or self.instance.discount_type

        if discount_type == "percentage" and discount > 100:
            raise serializers.ValidationError("Percentage discount cannot exceed 100%")
        if discount_type == "fixed" and discount > monthly_fee:
            raise serializers.ValidationError("Fixed discount cannot exceed the monthly fee")

        return data


class MemberStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Member.STATUS_CHOICES)


class MemberBulkActionSerializer(serializers.Serializer):
    member_ids = serializers.ListField(child=serializers.UUIDField())
    action = serializers.ChoiceField(choices=["activate", "deactivate", "suspend", "delete"])


class MemberExportSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="membership_plan.name", read_only=True)

    class Meta:
        model = Member
        fields = [
            "member_id", "full_name", "gender", "age", "phone_number",
            "email", "city", "state", "join_date", "plan_name",
            "membership_start_date", "membership_end_date",
            "monthly_fee", "discount", "status", "notes",
        ]
