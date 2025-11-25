from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CinemaViewSet, MovieViewSet, ShowtimeViewSet

router = DefaultRouter()
router.register(r'cinemas', CinemaViewSet)
router.register(r'movies', MovieViewSet)
router.register(r'showtimes', ShowtimeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]