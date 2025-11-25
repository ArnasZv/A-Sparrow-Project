from django.db import models
from datetime import timedelta

class Cinema(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    is_maxx = models.BooleanField(default=False)
    is_dluxx = models.BooleanField(default=False)
    is_lux = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.location}"

class Movie(models.Model):
    RATING_CHOICES = [
        ('G', 'General Audiences'),
        ('PG', 'Parental Guidance'),
        ('12A', '12A'),
        ('15A', '15A'),
        ('16', '16'),
        ('18', '18'),
    ]

    tmdb_id = models.IntegerField(null=True, blank=True, unique=True)
    
    title = models.CharField(max_length=300)
    description = models.TextField()
    duration = models.IntegerField(help_text="Duration in minutes")
    rating = models.CharField(max_length=5, choices=RATING_CHOICES)
    genre = models.CharField(max_length=100)
    release_date = models.DateField()
    poster_image = models.ImageField(upload_to='movie_posters/')
    banner_image = models.ImageField(upload_to='movie_banners/', null=True, blank=True)
    trailer_url = models.URLField(blank=True)
    director = models.CharField(max_length=200)
    cast = models.TextField()
    is_3d = models.BooleanField(default=False)
    is_imax = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Screen(models.Model):
    SCREEN_TYPES = [
        ('STANDARD', 'Standard'),
        ('MAXX', 'OmniplexMAXX'),
        ('DLUXX', "D'LUXX"),
        ('LUX', 'LUX'),
        ('RECLINE', 'Recline'),
    ]
    
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name='screens')
    name = models.CharField(max_length=100)
    screen_type = models.CharField(max_length=20, choices=SCREEN_TYPES)
    total_seats = models.IntegerField()
    rows = models.IntegerField(default=10)
    seats_per_row = models.IntegerField(default=15)
    
    def __str__(self):
        return f"{self.cinema.name} - {self.name}"

class Seat(models.Model):
    SEAT_TYPES = [
        ('STANDARD', 'Standard'),
        ('VIP', 'VIP'),
        ('RECLINE', 'Recline'),
        ('WHEELCHAIR', 'Wheelchair'),
        ('COMPANION', 'Wheelchair Companion'),
    ]
    
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=2)
    number = models.IntegerField()
    seat_type = models.CharField(max_length=20, choices=SEAT_TYPES, default='STANDARD')
    
    class Meta:
        unique_together = ['screen', 'row', 'number']
        ordering = ['row', 'number']
    
    def __str__(self):
        return f"{self.row}{self.number}"

class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='showtimes')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    base_price = models.DecimalField(max_digits=6, decimal_places=2)
    is_3d = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.movie.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def available_seats(self):
        from bookings.models import BookedSeat
        booked = BookedSeat.objects.filter(
            booking__showtime=self,
            booking__status__in=['PENDING', 'CONFIRMED']
        ).count()
        return self.screen.total_seats - booked
    
    def save(self, *args, **kwargs):
        if not self.end_time:
            self.end_time = self.start_time + timedelta(minutes=self.movie.duration + 30)
        super().save(*args, **kwargs)