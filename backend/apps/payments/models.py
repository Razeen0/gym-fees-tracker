from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import BaseModel


class Payment(BaseModel):
    PAYMENT_STATUS = [
        ("paid", "Paid"),
        ("pending", "Pending"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("net_banking", "Net Banking"),
        ("wallet", "Wallet"),
    ]

    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="payments",
        db_index=True,
    )
    receipt_number = models.CharField(max_length=50, unique=True, editable=False, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="cash")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="pending", db_index=True)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    remarks = models.TextField(blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)
    is_partial_payment = models.BooleanField(default=False)
    paid_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="collected_payments",
    )

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-payment_date", "-created_at"]
        indexes = [
            models.Index(fields=["member", "status"]),
            models.Index(fields=["member", "month", "year"]),
            models.Index(fields=["status", "due_date"]),
            models.Index(fields=["payment_date", "status"]),
            models.Index(fields=["month", "year"]),
        ]
        unique_together = [["member", "month", "year"]]

    def __str__(self):
        return f"{self.receipt_number} - {self.member.full_name} ({self.month}/{self.year})"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self._generate_receipt_number()
        if not self.total_amount:
            self.total_amount = self.amount + self.late_fee - self.discount_applied
        if self.amount_paid:
            self.balance = self.total_amount - self.amount_paid
        if self.amount_paid >= self.total_amount and self.status != "cancelled":
            self.status = "paid"
            self.is_partial_payment = False
        elif self.amount_paid > 0 and self.amount_paid < self.total_amount:
            self.is_partial_payment = True
        super().save(*args, **kwargs)

    def _generate_receipt_number(self):
        last_payment = Payment.objects.filter(is_deleted=False).order_by("-created_at").first()
        if last_payment and last_payment.receipt_number:
            last_num = int(last_payment.receipt_number.split("-")[1])
            new_num = last_num + 1
        else:
            new_num = 1001
        return f"RCP-{new_num}"


class PaymentHistory(BaseModel):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="history",
    )
    changed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    old_status = models.CharField(max_length=20, choices=Payment.PAYMENT_STATUS)
    new_status = models.CharField(max_length=20, choices=Payment.PAYMENT_STATUS)
    old_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    new_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "payment_history"
        verbose_name = "Payment History"
        verbose_name_plural = "Payment Histories"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.payment.receipt_number}: {self.old_status} -> {self.new_status}"
