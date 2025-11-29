from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class MyOmniPass(models.Model):
    TIER_CHOICES = [
        ('FREE', 'Free MyOmni'),
        ('STANDARD', 'MyOmniPass'),
        ('GOLD', 'MyOmniPass Gold'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='omnipass')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='FREE')
    monthly_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_active = models.BooleanField(default=False)
    subscription_start = models.DateField(null=True, blank=True)
    subscription_end = models.DateField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.tier}"
    
    def is_gold_eligible(self):
        from datetime import timedelta
        from django.utils import timezone
        if self.subscription_start:
            return timezone.now().date() >= self.subscription_start + timedelta(days=90)
        return False

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    preferred_cinema = models.ForeignKey('movies.Cinema', on_delete=models.SET_NULL, null=True, blank=True)
    receive_promotions = models.BooleanField(default=True)
    
    # Additional profile fields for user profile page
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        MyOmniPass.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
    if hasattr(instance, 'omnipass'):
        instance.omnipass.save()