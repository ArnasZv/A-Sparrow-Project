from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Booking, BookedSeat, Payment
from .serializers import BookingSerializer, BookingCreateSerializer, PaymentSerializer
from movies.models import Showtime, Seat
from decimal import Decimal, ROUND_HALF_UP
import stripe
import json
import traceback

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

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
                    total_amount=Decimal('0.00')
                )
                
                # Create booked seats and calculate total
                total = Decimal('0.00')
                
                for seat in seats:
                    # Convert base_price to Decimal
                    if isinstance(showtime.base_price, Decimal):
                        base_price = showtime.base_price
                    else:
                        base_price = Decimal(str(showtime.base_price))
                    
                    # Calculate price based on seat type using Decimal multiplication
                    if seat.seat_type == 'VIP':
                        price = base_price * Decimal('1.5')
                    elif seat.seat_type == 'RECLINE':
                        price = base_price * Decimal('1.3')
                    else:
                        price = base_price
                    
                    # Round to 2 decimal places
                    price = price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                    
                    BookedSeat.objects.create(
                        booking=booking,
                        seat=seat,
                        price=price
                    )
                    total = total + price
                
                # Get booking fee as Decimal (it's already Decimal from the model default)
                if isinstance(booking.booking_fee, Decimal):
                    booking_fee = booking.booking_fee
                else:
                    booking_fee = Decimal(str(booking.booking_fee))
                
                # Calculate final total - both are now Decimals
                final_total = total + booking_fee
                booking.total_amount = final_total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                booking.save()
                
                response_serializer = BookingSerializer(booking, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            
            print("=" * 80)
            print("BOOKING CREATION ERROR:")
            print(f"Error message: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            print("\nFull traceback:")
            traceback.print_exc()
            print("=" * 80)
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        from datetime import timedelta
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
        """
        Process payment for a booking using Stripe
        """
        booking = self.get_object()
        payment_method_id = request.data.get('payment_method_id')
        
        if not payment_method_id:
            return Response(
                {'error': 'Payment method required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if booking is already paid
        if booking.status == 'CONFIRMED':
            return Response(
                {'error': 'This booking has already been paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Safely convert Decimal amount to cents for Stripe
            total_amount = Decimal(str(booking.total_amount))
            amount_cents = int(total_amount * 100)
            
            # Create Payment Intent with Stripe
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='eur',
                payment_method=payment_method_id,
                confirm=True,
                metadata={
                    'booking_id': str(booking.id),
                    'user_id': str(request.user.id),
                },
                description=f'OmniWatch Cinema - Booking #{booking.booking_reference}',
                automatic_payment_methods={
                    'enabled': True,
                    'allow_redirects': 'never'
                }
            )
            
            # Check payment status
            if intent.status == 'succeeded':
                # Create payment record
                payment = Payment.objects.create(
                    booking=booking,
                    payment_method='STRIPE',
                    amount=booking.total_amount,
                    transaction_id=intent.id,
                    status='COMPLETED'
                )
                
                # Update booking status
                booking.status = 'CONFIRMED'
                booking.save()
                
                return Response({
                    'success': True,
                    'booking_id': booking.id,
                    'booking_reference': booking.booking_reference,
                    'transaction_id': payment.transaction_id,
                    'message': 'Payment successful'
                })
            
            elif intent.status == 'requires_action':
                # 3D Secure authentication required
                return Response({
                    'success': False,
                    'requires_action': True,
                    'client_secret': intent.client_secret,
                    'message': 'Additional authentication required'
                })
            
            else:
                return Response(
                    {'error': f'Payment failed with status: {intent.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except stripe.error.CardError as e:
            return Response(
                {'error': e.user_message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            print(f"Payment error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def create_payment_intent(self, request):
        
        booking_id = request.data.get('booking_id')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.status == 'CONFIRMED':
            return Response(
                {'error': 'This booking has already been paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convert Decimal to cents
            total_amount = Decimal(str(booking.total_amount))
            amount_cents = int(total_amount * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='eur',
                metadata={
                    'booking_id': str(booking.id),
                    'user_id': str(request.user.id),
                },
                description=f'OmniWatch Cinema - Booking #{booking.booking_reference}',
            )
            
            return Response({
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
            })
            
        except Exception as e:
            print(f"Payment intent creation error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def process_google_pay(self, request):
        """
        Process Google Pay payment
        URL: /api/bookings/bookings/process_google_pay/
        """
        booking_id = request.data.get('booking_id')
        payment_token = request.data.get('payment_token')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.status == 'CONFIRMED':
            return Response(
                {'error': 'This booking has already been paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convert Decimal to cents
            total_amount = Decimal(str(booking.total_amount))
            amount_cents = int(total_amount * 100)
            
            # Create Payment Intent with Google Pay token
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='eur',
                payment_method_data={
                    'type': 'card',
                    'card': {
                        'token': payment_token,
                    },
                },
                confirm=True,
                metadata={
                    'booking_id': str(booking.id),
                    'user_id': str(request.user.id),
                    'payment_method': 'google_pay',
                },
            )
            
            if intent.status == 'succeeded':
                payment = Payment.objects.create(
                    booking=booking,
                    payment_method='STRIPE',
                    amount=booking.total_amount,
                    transaction_id=intent.id,
                    status='COMPLETED'
                )
                
                booking.status = 'CONFIRMED'
                booking.save()
                
                return Response({
                    'success': True,
                    'booking_id': booking.id,
                    'booking_reference': booking.booking_reference,
                    'transaction_id': payment.transaction_id,
                })
            else:
                return Response(
                    {'error': 'Payment failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print(f"Google Pay error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    URL: /api/bookings/bookings/webhook/
    
    IMPORTANT: This endpoint must be accessible without authentication
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)
    
    # Handle different event types
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        booking_id = payment_intent['metadata'].get('booking_id')
        
        if booking_id:
            try:
                booking = Booking.objects.get(id=int(booking_id))
                
                # Create payment record if not exists
                if not Payment.objects.filter(transaction_id=payment_intent['id']).exists():
                    Payment.objects.create(
                        booking=booking,
                        payment_method='STRIPE',
                        amount=booking.total_amount,
                        transaction_id=payment_intent['id'],
                        status='COMPLETED'
                    )
                
                booking.status = 'CONFIRMED'
                booking.save()
                
                print(f"Webhook: Payment successful for booking {booking.booking_reference}")
                
            except Booking.DoesNotExist:
                print(f"Webhook: Booking {booking_id} not found")
            except Exception as e:
                print(f"Webhook processing error: {str(e)}")
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        booking_id = payment_intent['metadata'].get('booking_id')
        
        if booking_id:
            try:
                booking = Booking.objects.get(id=int(booking_id))
                
                Payment.objects.create(
                    booking=booking,
                    payment_method='STRIPE',
                    amount=booking.total_amount,
                    transaction_id=payment_intent['id'],
                    status='FAILED'
                )
                
                print(f"Webhook: Payment failed for booking {booking.booking_reference}")
                
            except Booking.DoesNotExist:
                print(f"Webhook: Booking {booking_id} not found")
            except Exception as e:
                print(f"Webhook processing error: {str(e)}")
    
    return JsonResponse({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_promo_code(request):
    """
    Apply a promotional code
    URL: /api/bookings/bookings/promo-code/
    """
    code = request.data.get('code', '').upper()
    booking_id = request.data.get('booking_id')
    
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    

    return Response({
        'success': False,
        'message': 'Promo code functionality coming soon'
    })