from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('forgot-username/', views.forgot_username, name='forgot-username'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('contact/', views.contact_form, name='contact-form'),
]