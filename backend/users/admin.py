from django.contrib import admin
from .models import MyOmniPass, UserProfile

@admin.register(MyOmniPass)
class MyOmniPassAdmin(admin.ModelAdmin):
    list_display = ['user', 'tier', 'is_active', 'subscription_start', 'subscription_end']
    list_filter = ['tier', 'is_active']
    search_fields = ['user__username', 'user__email']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'preferred_cinema']
    search_fields = ['user__username', 'user__email', 'phone']