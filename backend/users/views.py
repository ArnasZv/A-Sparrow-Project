from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to OmniWatch Cinema! 🎬',
                message=f'''
Hello {user.first_name or user.username}!

Welcome to OmniWatch Cinema! Your account has been successfully created.

You can now:
✓ Browse the latest movies
✓ Book tickets online
✓ Access your personal dashboard
✓ Manage your bookings

Start exploring: http://localhost:3000

Enjoy the show!

Best regards,
The OmniWatch Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email send error: {e}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Registration successful! Check your email.'
        }, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"
        
        # Send email
        send_mail(
            subject='Reset Your OmniWatch Password 🔐',
            message=f'''
Hello {user.first_name or user.username},

We received a request to reset your password for your OmniWatch Cinema account.

Click the link below to reset your password:
{reset_link}

If you didn't request this, please ignore this email.

This link will expire in 24 hours.

Best regards,
The OmniWatch Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response({
            'success': True,
            'message': 'Password reset email sent! Check your inbox.'
        })
        
    except User.DoesNotExist:
        # Don't reveal if email exists for security
        return Response({
            'success': True,
            'message': 'If that email exists, we sent a reset link.'
        })
    except Exception as e:
        return Response({
            'error': 'Failed to send email. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_username(request):
    """Send username reminder email"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Send email
        send_mail(
            subject='Your OmniWatch Username 👤',
            message=f'''
Hello {user.first_name or 'there'},

Your OmniWatch Cinema username is: {user.username}

You can use this username to log in at: http://localhost:3000/login

Best regards,
The OmniWatch Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response({
            'success': True,
            'message': 'Username reminder sent! Check your email.'
        })
        
    except User.DoesNotExist:
        return Response({
            'success': True,
            'message': 'If that email exists, we sent your username.'
        })
    except Exception as e:
        return Response({
            'error': 'Failed to send email. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password reset successful! You can now log in.'
            })
        else:
            return Response({
                'error': 'Invalid or expired reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({
            'error': 'Invalid reset link'
        }, status=status.HTTP_400_BAD_REQUEST)