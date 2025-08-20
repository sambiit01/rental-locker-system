from rest_framework import serializers
from .models import Student
from django.contrib.auth.hashers import make_password

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'username', 'student_id', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
 

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.email_verified:
            raise AuthenticationFailed('Email not verified. Please check your inbox.')

        return data


from rest_framework import serializers
from .models import Locker

class LockerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locker
        fields = ['id', 'locker_number', 'is_booked', 'booked_by']
        read_only_fields = ['is_booked', 'booked_by']


from rest_framework import serializers
from .models import Booking, Locker

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'student', 'locker', 'timestamp']
        read_only_fields = ['id', 'timestamp']

    def validate(self, data):
        # Student should not already have a booking
        if Booking.objects.filter(student=data['student']).exists():
            raise serializers.ValidationError("You already have a locker booked.")

        # Locker should be available
        if not data['locker'].is_available:
            raise serializers.ValidationError("This locker is already booked.")

        return data

    def create(self, validated_data):
        locker = validated_data['locker']
        locker.is_available = False
        locker.save()

        return super().create(validated_data)


from rest_framework import serializers
from .models import LockerAccessOTP, Booking
from django.utils import timezone
from datetime import timedelta
import random

class LockerOTPRequestSerializer(serializers.Serializer):
    def create_otp(self, booking):
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=5)
        otp_obj, created = LockerAccessOTP.objects.update_or_create(
            booking=booking,
            defaults={"otp_code": otp_code, "expires_at": expires_at}
        )
        return otp_code, expires_at

# lockers/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import LockerAccessLog

class LockerOTPVerifySerializer(serializers.Serializer):
    otp = serializers.CharField()

    def validate(self, data):
        user = self.context["request"].user
        otp = data["otp"]

        log = (
            LockerAccessLog.objects.filter(user=user, otp=otp, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not log:
            raise serializers.ValidationError({"error": "Invalid OTP"})

        # check expiry
        if hasattr(log, "expires_at") and log.expires_at < timezone.now():
            raise serializers.ValidationError({"error": "OTP expired"})

        # mark OTP as used
        log.is_used = True
        log.save()

        return data


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username   # 👈 add username to JWT payload
        return token
