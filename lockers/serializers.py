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

class LockerOTPVerifySerializer(serializers.Serializer):
    otp_code = serializers.CharField()

    def validate(self, data):
        request = self.context["request"]
        booking = Booking.objects.filter(student=request.user).first()
        if not booking:
            raise serializers.ValidationError("No booking found for this user.")
        
        try:
            otp_entry = LockerAccessOTP.objects.get(booking=booking)
        except LockerAccessOTP.DoesNotExist:
            raise serializers.ValidationError("No OTP generated.")

        if otp_entry.is_expired():
            raise serializers.ValidationError("OTP has expired.")

        if otp_entry.otp_code != data["otp_code"]:
            raise serializers.ValidationError("Invalid OTP code.")

        return data


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username   # 👈 add username to JWT payload
        return token
