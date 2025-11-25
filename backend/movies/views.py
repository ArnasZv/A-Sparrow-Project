from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from datetime import date, timedelta
from .models import Cinema, Movie, Screen, Seat, Showtime
from .serializers import (
    CinemaSerializer, MovieSerializer, ScreenSerializer, 
    SeatSerializer, ShowtimeSerializer, ShowtimeListSerializer
)

class CinemaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    permission_classes = [AllowAny]

class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rating', 'is_3d', 'is_imax', 'is_featured', 'genre']
    search_fields = ['title', 'director', 'cast', 'genre']
    ordering_fields = ['release_date', 'title', 'created_at']
    
    @action(detail=False, methods=['get'])
    def now_showing(self, request):
        """Get movies currently showing"""
        movies = Movie.objects.filter(
            showtimes__start_time__gte=date.today()
        ).distinct()
        
        serializer = self.get_serializer(movies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def coming_soon(self, request):
        """Get upcoming movies"""
        movies = Movie.objects.filter(
            release_date__gt=date.today()
        ).order_by('release_date')
        
        serializer = self.get_serializer(movies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def showtimes(self, request, pk=None):
        """Get showtimes for a specific movie"""
        movie = self.get_object()
        cinema_id = request.query_params.get('cinema')
        date_param = request.query_params.get('date', date.today())
        
        showtimes = Showtime.objects.filter(movie=movie, start_time__date=date_param)
        
        if cinema_id:
            showtimes = showtimes.filter(screen__cinema_id=cinema_id)
        
        serializer = ShowtimeListSerializer(showtimes, many=True, context={'request': request})
        return Response(serializer.data)

class ShowtimeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['movie', 'screen__cinema', 'is_3d']
    
    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        """Get available seats for a showtime"""
        showtime = self.get_object()
        seats = Seat.objects.filter(screen=showtime.screen)
        
        # Get booked seat IDs
        from bookings.models import BookedSeat
        booked_seat_ids = BookedSeat.objects.filter(
            booking__showtime=showtime,
            booking__status__in=['PENDING', 'CONFIRMED']
        ).values_list('seat_id', flat=True)
        
        # Add is_available field to each seat
        seats_data = SeatSerializer(seats, many=True).data
        for seat in seats_data:
            seat['is_available'] = seat['id'] not in booked_seat_ids
        
        return Response(seats_data)