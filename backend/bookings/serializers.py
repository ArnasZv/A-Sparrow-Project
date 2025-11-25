from rest_framework import serializers
from .models import Booking, BookedSeat, Payment
from movies.serializers import ShowtimeSerializer, SeatSerializer

class BookedSeatSerializer(serializers.ModelSerializer):
    seat = SeatSerializer(read_only=True)
    seat_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = BookedSeat
        fields = ['id', 'seat', 'seat_id', 'price']
        read_only_fields = ['price']

class BookingSerializer(serializers.ModelSerializer):
    booked_seats = BookedSeatSerializer(many=True, read_only=True)
    showtime = ShowtimeSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_reference', 'showtime', 'booked_seats', 
                  'total_amount', 'booking_fee', 'status', 'created_at', 'user_email']
        read_only_fields = ['booking_reference', 'total_amount', 'created_at']

class BookingCreateSerializer(serializers.Serializer):
    showtime_id = serializers.IntegerField()
    seat_ids = serializers.ListField(child=serializers.IntegerField())
    
    def validate(self, data):
        from movies.models import Showtime, Seat
        
        # Validate showtime exists
        try:
            showtime = Showtime.objects.get(id=data['showtime_id'])
        except Showtime.DoesNotExist:
            raise serializers.ValidationError("Showtime not found")
        
        # Validate seats exist and belong to showtime's screen
        seats = Seat.objects.filter(id__in=data['seat_ids'], screen=showtime.screen)
        if seats.count() != len(data['seat_ids']):
            raise serializers.ValidationError("Invalid seat selection")
        
        # Check if seats are already booked
        booked_seats = BookedSeat.objects.filter(
            booking__showtime=showtime,
            booking__status__in=['PENDING', 'CONFIRMED'],
            seat_id__in=data['seat_ids']
        )
        if booked_seats.exists():
            raise serializers.ValidationError("Some seats are already booked")
        
        return data

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['transaction_id', 'created_at']