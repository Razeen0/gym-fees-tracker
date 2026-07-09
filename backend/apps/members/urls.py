from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.MemberViewSet, basename="members")

urlpatterns = router.urls
