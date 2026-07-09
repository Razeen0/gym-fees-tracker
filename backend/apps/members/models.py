from django.core.validators import MinValueValidator
from django.db import models
from apps.common.models import BaseModel, AddressMixin


class Member(BaseModel, AddressMixin):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("suspended", "Suspended"),
        ("expired", "Expired"),
    ]

    member_id = models.CharField(max_length=20, unique=True, editable=False, db_index=True)
    full_name = models.CharField(max_length=255, db_index=True)
    profile_photo = models.ImageField(upload_to="members/photos/", blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    join_date = models.DateField(auto_now_add=True)
    membership_plan = models.ForeignKey(
        "plans.MembershipPlan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
    membership_start_date = models.DateField(blank=True, null=True)
    membership_end_date = models.DateField(blank=True, null=True)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_type = models.CharField(
        max_length=10,
        choices=[("percentage", "Percentage"), ("fixed", "Fixed")],
        default="percentage",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active", db_index=True)
    notes = models.TextField(blank=True)
    photo_id_proof = models.ImageField(upload_to="members/id_proofs/", blank=True, null=True)

    class Meta:
        db_table = "members"
        verbose_name = "Member"
        verbose_name_plural = "Members"
        indexes = [
            models.Index(fields=["member_id", "status"]),
            models.Index(fields=["status", "membership_end_date"]),
            models.Index(fields=["full_name", "phone_number"]),
        ]

    def __str__(self):
        return f"{self.member_id} - {self.full_name}"

    def save(self, *args, **kwargs):
        if not self.member_id:
            self.member_id = self._generate_member_id()
        if self.date_of_birth and not self.age:
            from datetime import date
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        super().save(*args, **kwargs)

    def _generate_member_id(self):
        last_member = Member.objects.filter(is_deleted=False).order_by("-created_at").first()
        if last_member and last_member.member_id:
            last_num = int(last_member.member_id.split("-")[1])
            new_num = last_num + 1
        else:
            new_num = 1001
        return f"GYM-{new_num}"

    @property
    def effective_fee(self):
        if self.discount_type == "percentage":
            return self.monthly_fee * (1 - self.discount / 100)
        return max(0, self.monthly_fee - self.discount)

    @property
    def is_membership_expired(self):
        from django.utils import timezone
        if self.membership_end_date:
            return timezone.now().date() > self.membership_end_date
        return False

    @property
    def days_until_expiry(self):
        from django.utils import timezone
        if self.membership_end_date:
            delta = self.membership_end_date - timezone.now().date()
            return delta.days
        return None
