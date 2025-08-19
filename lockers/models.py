
from django.db import models
from django.contrib.auth.models import AbstractUser
import random

class Student(AbstractUser):
    student_id = models.CharField(max_length=20, unique=True)
    email_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)

    def generate_otp(self):
        self.otp = f"{random.randint(100000, 999999)}"
        self.save()


from django.contrib.auth import get_user_model

User = get_user_model()

class Locker(models.Model):
    locker_number = models.CharField(max_length=10, unique=True)
    is_booked = models.BooleanField(default=False)
    booked_by = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="locker")
    is_available = models.BooleanField(default=True)
    def __str__(self):
        return f"Locker {self.locker_number} - {'Booked' if self.is_booked else 'Available'}"
    

from django.db import models
from django.utils import timezone

from datetime import timedelta
from django.utils.timezone import now
class Booking(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    locker = models.ForeignKey(Locker, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)  # new field

    def save(self, *args, **kwargs):
        if not self.start_time:
            self.start_time = now()
        # Only set end_time if not already set
        if not self.end_time:
            self.end_time = self.start_time + timedelta(minutes=1)  # test mode
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking: {self.student} - {self.locker}"

    

from django.db import models
from django.utils import timezone
from datetime import timedelta

class LockerAccessOTP(models.Model):
    booking = models.OneToOneField("Booking", on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at


    

from django.db import models
from django.conf import settings

# class LockerRentalArchive(models.Model):
#     student = models.ForeignKey("Student", on_delete=models.CASCADE)
#     locker = models.ForeignKey("Locker", on_delete=models.CASCADE)
#     booked_at = models.DateTimeField()
#     ended_at = models.DateTimeField()
#     was_overdue = models.BooleanField(default=False)
#     fine_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

#     def __str__(self):
#         return f"{self.student.user.username} - Locker {self.locker.locker_number} (Archived)"


class LockerRentalArchive(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    locker = models.ForeignKey(Locker, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    overdue = models.BooleanField(default=False)
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.student} - {self.locker}"


class LockerReturnLog(models.Model):
    student = models.ForeignKey("Student", on_delete=models.CASCADE)
    locker = models.ForeignKey("Locker", on_delete=models.CASCADE)
    returned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Return Log - {self.student.user.username} - Locker {self.locker.locker_number}"





class LockerAccessLog(models.Model):
    locker = models.ForeignKey(Locker, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    action = models.CharField(max_length=20)  # e.g., "return", "access"
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.action} - {self.locker.locker_id}"

