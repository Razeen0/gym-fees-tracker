from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import BaseModel


class MembershipPlan(BaseModel):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    HALF_YEARLY = "half_yearly"
    YEARLY = "yearly"
    DURATION_CHOICES = [
        (MONTHLY, "Monthly"),
        (QUARTERLY, "Quarterly"),
        (HALF_YEARLY, "Half Yearly"),
        (YEARLY, "Yearly"),
    ]

    name = models.CharField(max_length=255)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    duration_days = models.PositiveIntegerField(editable=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    benefits = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    is_popular = models.BooleanField(default=False)
    max_members = models.PositiveIntegerField(default=0, help_text="0 means unlimited")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "membership_plans"
        verbose_name = "Membership Plan"
        verbose_name_plural = "Membership Plans"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return f"{self.name} - {self.get_duration_display()}"

    def save(self, *args, **kwargs):
        duration_map = {
            self.MONTHLY: 30,
            self.QUARTERLY: 90,
            self.HALF_YEARLY: 180,
            self.YEARLY: 365,
        }
        self.duration_days = duration_map.get(self.duration, 30)
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        return self.discounted_price if self.discounted_price else self.price
