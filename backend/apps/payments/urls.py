from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.PaymentViewSet, basename="payments")

urlpatterns = router.urls
