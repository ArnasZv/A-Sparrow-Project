from django.urls import path
from .views import RegisterView, UserProfileView, forgot_password, forgot_username, reset_password

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('forgot-username/', forgot_username, name='forgot_username'),
    path('reset-password/', reset_password, name='reset_password'),
]