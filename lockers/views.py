from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import StudentSerializer
from .models import Student
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Locker
from .serializers import LockerSerializer
from django.conf import settings
class RegisterStudentView(APIView):
    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save()
            student.generate_otp()

            # Build frontend verification link
            verification_link = f"{settings.FRONTEND_ORIGIN}/verify-email?otp={student.otp}&email={student.email}"

            # Send email with OTP + link
            send_mail(
                subject='Verify Your Email',
                message=(
                    f'Your OTP is: {student.otp}\n\n'
                    f'Click here to verify: {verification_link}'
                ),
                from_email=None,
                recipient_list=[student.email],
            )

            return Response(
                {"message": "Registered. Please verify your email with the OTP sent."},
                status=201
            )
        else:
            return Response(serializer.errors, status=400)




# lockers/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Student

class VerifyEmailView(APIView):
    def get(self, request):
        otp = request.GET.get("otp")
        email = request.GET.get("email")
        username = request.GET.get("username")

        try:
            if email:
                # Email link verification
                student = Student.objects.get(email=email, otp=otp)
            elif username:
                # Manual form verification
                student = Student.objects.get(username=username, otp=otp)
            else:
                return Response({"message": "Missing email/username"}, status=400)

            student.email_verified = True
            student.otp = None
            student.save()
            return Response({"message": "Email verified successfully!"}, status=200)

        except Student.DoesNotExist:
            return Response({"message": "User not found or OTP invalid"}, status=400)






class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer




class AvailableLockersList(generics.ListAPIView):
    queryset = Locker.objects.filter(is_booked=False)
    serializer_class = LockerSerializer
    permission_classes = [permissions.IsAuthenticated]


    

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer

class CancelBookingView(generics.DestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        try:
            booking = self.get_object()

            # Only allow if admin or booking owner
            if request.user.is_staff or booking.student == request.user:
                booking.delete()
                return Response({"message": "✅ Booking cancelled successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "❌ You can only cancel your own booking."},
                                status=status.HTTP_403_FORBIDDEN)

        except Booking.DoesNotExist:
            return Response({"error": "⚠️ Booking not found."}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Locker, Booking, Student,LockerRentalArchive, LockerReturnLog

class BookLockerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user  # ✅ request.user is already Student

        # ✅ Check if student already has a booking
        if Booking.objects.filter(student=student).exists():
            return Response({"error": "You already have a locker booked."}, status=status.HTTP_400_BAD_REQUEST)

        locker_number = request.data.get("locker_number")
        try:
            locker = Locker.objects.get(locker_number=locker_number)
        except Locker.DoesNotExist:
            return Response({"error": "Locker not found."}, status=status.HTTP_404_NOT_FOUND)

        if not locker.is_available:
            return Response({"error": "Locker is not available."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Create booking
        Booking.objects.create(student=student, locker=locker)
        locker.is_available = False
        locker.save()

        return Response({"message": f"Locker {locker_number} booked successfully."}, status=status.HTTP_201_CREATED)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import LockerOTPRequestSerializer, LockerOTPVerifySerializer

class LockerOTPRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking = Booking.objects.filter(student=request.user).first()
        if not booking:
            return Response({"error": "No booking found."}, status=400)
        
        serializer = LockerOTPRequestSerializer()
        otp_code, expires_at = serializer.create_otp(booking)
        return Response({
            "message": "OTP generated successfully.",
            "otp_code": otp_code,  # For now returning in response; later send via email
            "expires_at": expires_at
        })

class LockerOTPVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LockerOTPVerifySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Locker unlocked successfully ✅"})



from django.core.mail import send_mail
from django.utils.timezone import now, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import random

from .models import LockerAccessOTP, Booking

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_locker_access1(request):
    print("DEBUG: Running UPDATED request_locker_access function")

    try:
        booking = Booking.objects.get(student=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "You do not have a booked locker."}, status=400)

    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    expiry_time = now() + timedelta(minutes=5)

    # Store OTP in DB (update if exists)
    LockerAccessOTP.objects.update_or_create(
        booking=booking,
        defaults={"otp_code": otp_code, "expires_at": expiry_time}
    )

    # Send OTP via Email
    try:
        send_mail(
            subject="Your Locker Access OTP",
            message=(
                f"Hello {request.user.username},\n\n"
                f"Your OTP to unlock locker {booking.locker.locker_number} is: {otp_code}\n"
                f"This OTP will expire at {expiry_time.strftime('%H:%M:%S')}.\n\n"
                f"Thank you,\nRental Locker Team"
            ),
            from_email="sambitbhoumik01@gmail.com",  # change if needed
            recipient_list=[request.user.email],
            fail_silently=False
        )
    except Exception as e:
        return Response({"error": f"OTP generated but email failed: {str(e)}"}, status=500)

    # API Response
    return Response({
        "message": "✅ OTP generated and sent to your registered email.",
        "otp_code": otp_code,
        "expires_at": expiry_time
    })


from django.utils.timezone import now
from datetime import timedelta
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Booking, Locker, LockerRentalArchive, LockerAccessLog

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def return_locker(request):
    try:
        # Find the active booking for the user
        booking = Booking.objects.filter(student=request.user).first()

        if not booking:
            return Response({"error": "No active booking found."}, status=status.HTTP_404_NOT_FOUND)

        locker = booking.locker
        current_time = now()

        # Check if overdue
        overdue = True
        fine = Decimal("0.00")
        if booking.end_time and current_time > booking.end_time:
            overdue = True
            # days_overdue = (current_time - booking.end_time).days or 1  # at least 1 day
            # fine = Decimal(days_overdue * 50)  # ₹50/day fine (mock value)
            minutes_overdue = int((current_time - booking.end_time).total_seconds() // 60) or 1  # at least 1 min
            fine = Decimal(minutes_overdue * 50)  # ₹50/min fine for testing

        # Archive the rental
        LockerRentalArchive.objects.create(
            student=booking.student,
            locker=locker,
            start_time=booking.start_time,
            end_time=current_time,
            overdue=overdue,
            fine=fine
        )

        # Log the return action
        LockerAccessLog.objects.create(
            locker=locker,
            student=booking.student,
            action="return",
            timestamp=current_time,
            details=f"Locker returned. Overdue: {overdue}, Fine: ₹{fine}"
        )

        # Set locker to available and delete booking
        locker.is_available = True
        locker.save()
        booking.delete()

        return Response({
            "message": "Locker returned successfully.",
            "overdue": overdue,
            "fine": f"₹{fine}"
        }, status=status.HTTP_200_OK)

    except Booking.DoesNotExist:
        return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


