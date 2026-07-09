from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.NotificationViewSet, basename="notifications")

urlpatterns = router.urls
