from lockers.models import Locker, Booking, Student

# Step 1: Show locker status
available_lockers = Locker.objects.filter(is_available=True)
unavailable_lockers = Locker.objects.filter(is_available=False)

print("\n Available Lockers:")
for locker in available_lockers:
    print(f"  - {locker.locker_number}")

print("\n Unavailable Lockers:")
for locker in unavailable_lockers:
    print(f"  - {locker.locker_number}")

# Step 2: Get student username
username = input("\nEnter your username: ").strip()

try:
    student = Student.objects.get(username=username)  # <-- FIXED
except Student.DoesNotExist:
    print(f" Student '{username}' not found.")
else:
    # Step 3: Get locker choice
    locker_number = input("Enter the locker number you want to book (e.g., LCKR-001): ").strip()

    try:
        locker = Locker.objects.get(locker_number=locker_number)
    except Locker.DoesNotExist:
        print(f" Locker '{locker_number}' does not exist.")
    else:
        # Step 4: Booking logic
        if Booking.objects.filter(student=student).exists():
            print(f" {username} already has a booking.")
        elif not locker.is_available:
            print(f" Locker {locker_number} is not available.")
        else:
            Booking.objects.create(student=student, locker=locker)
            locker.is_available = False
            locker.save()
            print(f" {username} successfully booked locker {locker_number}.")
