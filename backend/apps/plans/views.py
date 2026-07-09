from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrOwner

from .filters import MembershipPlanFilter
from .models import MembershipPlan
from .serializers import MembershipPlanListSerializer, MembershipPlanSerializer


class MembershipPlanViewSet(ModelViewSet):
    queryset = MembershipPlan.objects.all()
    filterset_class = MembershipPlanFilter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price", "duration_days", "sort_order", "created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return MembershipPlanListSerializer
        return MembershipPlanSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.soft_delete()

    @action(detail=False, methods=["get"])
    def active(self, request):
        plans = self.get_queryset().filter(is_active=True)
        serializer = MembershipPlanListSerializer(plans, many=True)
        return Response({
            "success": True,
            "message": "Active plans retrieved",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def toggle_status(self, request, pk=None):
        plan = self.get_object()
        plan.is_active = not plan.is_active
        plan.save()
        serializer = MembershipPlanSerializer(plan)
        return Response({
            "success": True,
            "message": f"Plan {'activated' if plan.is_active else 'deactivated'}",
            "data": serializer.data,
            "errors": [],
        }, status=status.HTTP_200_OK)
