from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.DashboardViewSet, basename="dashboard")

urlpatterns = router.urls
