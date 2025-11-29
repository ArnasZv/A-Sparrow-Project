from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, stripe_webhook, apply_promo_code

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional payment endpoints (never ended up in bookings/views.py)
    path('bookings/webhook/', stripe_webhook, name='stripe_webhook'),
    path('bookings/promo-code/', apply_promo_code, name='apply_promo_code'),
]