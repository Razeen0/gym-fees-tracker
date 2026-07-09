from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, ViewSet
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin

from apps.common.permissions import IsAdminOrOwner

from .models import AuditLog, GymSettings
from .serializers import AuditLogSerializer, GymSettingsSerializer


class GymSettingsViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = GymSettings.objects.all()
    serializer_class = GymSettingsSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_object(self):
        obj, created = GymSettings.objects.get_or_create(id=1)
        return obj

    @action(detail=False, methods=["get"])
    def public(self, request):
        settings = self.get_object()
        serializer = GymSettingsSerializer(settings)
        public_data = {
            "gym_name": serializer.data["gym_name"],
            "currency": serializer.data["currency"],
            "currency_symbol": serializer.data["currency_symbol"],
            "timezone": serializer.data["timezone"],
            "tax_percentage": serializer.data["tax_percentage"],
            "tax_name": serializer.data["tax_name"],
            "receipt_footer": serializer.data["receipt_footer"],
            "late_fee_percentage": serializer.data["late_fee_percentage"],
        }
        return Response({
            "success": True,
            "message": "Public settings retrieved",
            "data": public_data,
            "errors": [],
        }, status=status.HTTP_200_OK)


class AuditLogViewSet(ListModelMixin, GenericViewSet):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    search_fields = ["user__full_name", "action", "model_name"]
    ordering_fields = ["-created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return AuditLog.objects.select_related("user").all()[:100]
