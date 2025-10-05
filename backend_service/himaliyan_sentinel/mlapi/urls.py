# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import MLRequestView

# router = DefaultRouter()
# router.register(r'ml-requests', MLRequestView)

# urlpatterns = [
#     path('', include(router.urls)),
# ]
from django.urls import path
from .views import MLRequestView, AOIFormatView, MapSelectorView, ServiceStatusView

urlpatterns = [
    path('', MapSelectorView.as_view(), name='map-selector'),
    path('ml-request/', MLRequestView.as_view(), name='ml-request'),
    path('aoi-format/', AOIFormatView.as_view(), name='aoi-format'),
    path('service-status/', ServiceStatusView.as_view(), name='service-status'),
]
