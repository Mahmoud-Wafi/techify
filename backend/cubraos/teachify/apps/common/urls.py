from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, CertificateRequestViewSet

router = DefaultRouter()
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("certificate-requests", CertificateRequestViewSet, basename="certificate-requests")

urlpatterns = router.urls
