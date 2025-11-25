from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Booking, BookedSeat, Payment
from .serializers import BookingSerializer, BookingCreateSerializer, PaymentSerializer
from movies.models import Showtime, Seat

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')
    
    def create(self, request):
        """Create a new booking"""
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        showtime_id = serializer.validated_data['showtime_id']
        seat_ids = serializer.validated_data['seat_ids']
        
        try:
            with transaction.atomic():
                showtime = Showtime.objects.select_for_update().get(id=showtime_id)
                seats = Seat.objects.filter(id__in=seat_ids)
                
                # Create booking
                booking = Booking.objects.create(
                    user=request.user,
                    showtime=showtime,
                    total_amount=0
                )
                
                # Create booked seats and calculate total
                total = 0
                for seat in seats:
                    price = showtime.base_price
                    if seat.seat_type == 'VIP':
                        price *= 1.5
                    elif seat.seat_type == 'RECLINE':
                        price *= 1.3
                    
                    BookedSeat.objects.create(
                        booking=booking,
                        seat=seat,
                        price=price
                    )
                    total += price
                
                booking.total_amount = total + booking.booking_fee
                booking.save()
                
                response_serializer = BookingSerializer(booking, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Can only cancel 2+ hours before showtime
        if booking.showtime.start_time < timezone.now() + timedelta(hours=2):
            return Response(
                {'error': 'Cannot cancel within 2 hours of showtime'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'CANCELLED'
        booking.save()
        
        return Response({'status': 'Booking cancelled successfully'})
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process payment for a booking"""
        booking = self.get_object()
        payment_method_id = request.data.get('payment_method_id')
        
        if not payment_method_id:
            return Response(
                {'error': 'Payment method required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Here you would integrate with Stripe
            # For now, we'll simulate success
            import uuid
            
            payment = Payment.objects.create(
                booking=booking,
                payment_method='STRIPE',
                amount=booking.total_amount,
                transaction_id=str(uuid.uuid4()),
                status='COMPLETED'
            )
            
            booking.status = 'CONFIRMED'
            booking.save()
            
            return Response({
                'success': True,
                'booking_id': booking.id,
                'transaction_id': payment.transaction_id
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
