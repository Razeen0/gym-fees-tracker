from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("gym", views.GymSettingsViewSet, basename="settings")
router.register("audit-logs", views.AuditLogViewSet, basename="audit-logs")

urlpatterns = router.urls
