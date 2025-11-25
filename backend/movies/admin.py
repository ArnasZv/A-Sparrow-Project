from django.contrib import admin
from .models import Cinema, Movie, Screen, Seat, Showtime

@admin.register(Cinema)
class CinemaAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'is_maxx', 'is_dluxx']
    search_fields = ['name', 'location']

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'rating', 'duration', 'release_date', 'is_featured']
    list_filter = ['rating', 'is_3d', 'is_imax', 'genre']
    search_fields = ['title', 'director', 'cast']
    date_hierarchy = 'release_date'

@admin.register(Screen)
class ScreenAdmin(admin.ModelAdmin):
    list_display = ['cinema', 'name', 'screen_type', 'total_seats']
    list_filter = ['cinema', 'screen_type']

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['screen', 'row', 'number', 'seat_type']
    list_filter = ['screen', 'seat_type']

@admin.register(Showtime)
class ShowtimeAdmin(admin.ModelAdmin):
    list_display = ['movie', 'screen', 'start_time', 'base_price', 'available_seats']
    list_filter = ['screen__cinema', 'is_3d', 'start_time']
    date_hierarchy = 'start_time'