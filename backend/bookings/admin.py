from django.contrib import admin
from .models import Booking, BookedSeat, Payment

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_reference', 'user', 'showtime', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['booking_reference', 'user__username', 'user__email']
    date_hierarchy = 'created_at'

@admin.register(BookedSeat)
class BookedSeatAdmin(admin.ModelAdmin):
    list_display = ['booking', 'seat', 'price']
    list_filter = ['booking__status']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking', 'payment_method', 'amount', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['transaction_id', 'booking__booking_reference']