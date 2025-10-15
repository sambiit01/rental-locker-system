# **App Name**: LockerLease

## Core Features:

- Student Registration and Verification: Students register with ID, name, and email; verified via OTP sent through free SMTP before login.
- Student Login and Authentication: Verified students authenticate using email and password, receiving a JWT for session management.
- Locker Rental: Students view available lockers, accept terms, and complete a mock payment to rent a locker, which updates locker status.
- Temporary Access Code Generation: Generate an OTP to simulate unlocking for temporary locker access, with attempts logged.
- Locker Return: Check for overdue status, calculate a mock penalty, set the locker as available, and archive the record.
- Overdue Locker Handling: A daily job marks overdue lockers as restricted, emails the student, and logs mock penalties.
- Waitlist Notification: Students queue for lockers; notify the next student when a locker becomes available.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) to evoke trust and security.
- Background color: Light gray (#F0F0F0) for a clean and neutral backdrop.
- Accent color: Muted orange (#F2BE22) for actionable elements and important notifications.
- Body and headline font: 'PT Sans', a humanist sans-serif that combines a modern look and a little warmth or personality, making it suitable for both headlines or body text.
- Simple and clear icons to represent locker status and actions.
- A clean, grid-based layout with intuitive navigation for easy locker selection and management.
- Subtle transitions and feedback animations for a smooth user experience when renting, returning, or accessing lockers.