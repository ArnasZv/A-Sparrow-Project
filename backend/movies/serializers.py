from rest_framework import serializers
from .models import Cinema, Movie, Screen, Seat, Showtime

class MovieSerializer(serializers.ModelSerializer):
    poster_image = serializers.SerializerMethodField()
    banner_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = '__all__'
    
    def get_poster_image(self, obj):
        if not obj.poster_image:
            return None
        
       
        poster_path = obj.poster_image.name if hasattr(obj.poster_image, 'name') else str(obj.poster_image)
        
       
        if poster_path.startswith('http://') or poster_path.startswith('https://'):
            return poster_path
        
       
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.poster_image.url)
        return None
    
    def get_banner_image(self, obj):
        if not obj.banner_image:
            return None
        
        
        banner_path = obj.banner_image.name if hasattr(obj.banner_image, 'name') else str(obj.banner_image)
        
      
        if banner_path.startswith('http://') or banner_path.startswith('https://'):
            return banner_path
        
       
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.banner_image.url)
        return None
        
class ScreenSerializer(serializers.ModelSerializer):
    cinema = CinemaSerializer(read_only=True)
    
    class Meta:
        model = Screen
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

class ShowtimeSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    screen = ScreenSerializer(read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Showtime
        fields = '__all__'

class ShowtimeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing showtimes"""
    cinema_name = serializers.CharField(source='screen.cinema.name', read_only=True)
    cinema_location = serializers.CharField(source='screen.cinema.location', read_only=True)
    screen_name = serializers.CharField(source='screen.name', read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Showtime
        fields = ['id', 'movie_title', 'cinema_name', 'cinema_location', 
                  'screen_name', 'start_time', 'base_price', 'is_3d', 'available_seats']
