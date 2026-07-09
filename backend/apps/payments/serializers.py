from rest_framework import serializers

from apps.members.serializers import MemberListSerializer

from .models import Payment, PaymentHistory


class PaymentListSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    member_id_display = serializers.CharField(source="member.member_id", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "receipt_number", "member", "member_name",
            "member_id_display", "amount", "total_amount",
            "amount_paid", "balance", "payment_date", "due_date",
            "payment_method", "status", "month", "year",
            "late_fee", "discount_applied", "is_partial_payment",
            "remarks", "created_at",
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    member_details = MemberListSerializer(source="member", read_only=True)
    collected_by = serializers.CharField(source="paid_by.full_name", read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "receipt_number", "member", "member_details",
            "amount", "due_amount", "late_fee", "discount_applied",
            "total_amount", "amount_paid", "balance",
            "payment_date", "due_date", "payment_method",
            "status", "month", "year", "remarks",
            "payment_reference", "is_partial_payment",
            "paid_by", "collected_by",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "receipt_number", "total_amount", "balance",
            "created_at", "updated_at",
        ]

    def get_history(self, obj):
        history = obj.history.select_related("changed_by").all()[:10]
        return PaymentHistorySerializer(history, many=True).data


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "member", "amount", "due_amount", "late_fee",
            "discount_applied", "amount_paid",
            "payment_date", "due_date", "payment_method",
            "status", "month", "year", "remarks",
            "payment_reference",
        ]

    def validate(self, data):
        member = data.get("member")
        month = data.get("month")
        year = data.get("year")

        if Payment.objects.filter(
            member=member,
            month=month,
            year=year,
            is_deleted=False,
        ).exclude(status="cancelled").exists():
            raise serializers.ValidationError(
                f"A payment record already exists for {member.full_name} for {month}/{year}"
            )

        amount = data.get("amount", 0)
        late_fee = data.get("late_fee", 0)
        discount = data.get("discount_applied", 0)
        amount_paid = data.get("amount_paid", 0)
        total = amount + late_fee - discount

        if amount_paid > total:
            raise serializers.ValidationError("Amount paid cannot exceed total amount")

        if month < 1 or month > 12:
            raise serializers.ValidationError("Month must be between 1 and 12")

        return data


class PaymentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "amount", "due_amount", "late_fee",
            "discount_applied", "amount_paid",
            "payment_date", "due_date", "payment_method",
            "status", "remarks", "payment_reference",
        ]

    def validate_amount_paid(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount paid cannot be negative")
        return value


class PaymentStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Payment.PAYMENT_STATUS)
    notes = serializers.CharField(required=False, allow_blank=True)


class PaymentHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.full_name", read_only=True)

    class Meta:
        model = PaymentHistory
        fields = [
            "id", "old_status", "new_status",
            "old_amount", "new_amount",
            "changed_by", "changed_by_name",
            "notes", "created_at",
        ]


class PaymentBulkCreateSerializer(serializers.Serializer):
    member_ids = serializers.ListField(child=serializers.UUIDField())
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2020, max_value=2100)
    due_date = serializers.DateField()
    remarks = serializers.CharField(required=False, allow_blank=True)


class PaymentSummarySerializer(serializers.Serializer):
    total_collected = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_overdue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_count = serializers.IntegerField()
    paid_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
