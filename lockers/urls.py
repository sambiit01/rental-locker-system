from django.urls import path
from .views import RegisterStudentView, VerifyEmailView
from .views import LogoutView
urlpatterns = [
    path('register/', RegisterStudentView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('logout/', LogoutView.as_view(), name='logout'),
]


from .views import CustomLoginView

urlpatterns += [
    path('token/', CustomLoginView.as_view(), name='custom_token_obtain_pair'),
]

from django.urls import path
from .views import AvailableLockersList, BookLockerView

urlpatterns += [
    path('lockers/available/', AvailableLockersList.as_view(), name='available-lockers'),
    path('lockers/book/<int:locker_id>/', BookLockerView.as_view(), name='book-locker'),
]


from .views import BookLockerView

urlpatterns += [
    path('book-locker/', BookLockerView.as_view(), name='book-locker'),
]

from django.urls import path
from .views import CancelBookingView

urlpatterns += [
    path('bookings/<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]


from django.urls import path
from .views import request_locker_access1, LockerOTPVerifyView

urlpatterns += [
    # Locker access request — now uses the updated function that sends email
    path('locker-access/request/', request_locker_access1, name='request-locker-access'),

    # Locker OTP verification (unchanged)
    path('locker-access/verify/', LockerOTPVerifyView.as_view(), name='locker-otp-verify'),
]



# from django.urls import path
#from .views import request_locker_access1

# urlpatterns += [
#     path('locker-access/request/', request_locker_access1, name='request-locker-access'),
# ]

from .views import return_locker
urlpatterns += [
    path('locker/return/', return_locker, name='return-locker'),
]




