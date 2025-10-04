from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MLRequestView

router = DefaultRouter()
router.register(r'ml-requests', MLRequestView)

urlpatterns = [
    path('', include(router.urls)),
]
