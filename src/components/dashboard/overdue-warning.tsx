
"use client";

import { useLocker } from "@/hooks/use-locker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

const WARNING_THRESHOLD_SECONDS = 30; // Show warning when less than 30 seconds remain

export default function OverdueWarning() {
  const { lockers, currentUser } = useLocker();
  const [timeLeft, setTimeLeft] = useState("");
  const myLocker = lockers.find(l => l.rentedBy === currentUser?.id);

  useEffect(() => {
    if (!myLocker || !myLocker.dueDate) return;

    const interval = setInterval(() => {
      const dueDate = new Date(myLocker.dueDate!);
      const now = new Date();
      
      if (now > dueDate) {
          setTimeLeft("Overdue");
      } else {
        const distance = formatDistanceToNow(dueDate);
        setTimeLeft(`${distance} left`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myLocker]);

  if (!myLocker || !myLocker.dueDate) {
    return null;
  }
  
  const dueDate = new Date(myLocker.dueDate);
  const now = new Date();
  const secondsRemaining = differenceInSeconds(dueDate, now);

  if (myLocker.status === 'overdue') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Locker Overdue!</AlertTitle>
        <AlertDescription>
          Your rental for Locker #{myLocker.id} is overdue. Please return it as soon as possible to avoid further penalties.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (secondsRemaining > 0 && secondsRemaining <= WARNING_THRESHOLD_SECONDS) {
    return (
         <Alert>
            <Hourglass className="h-4 w-4" />
            <AlertTitle>Rental Expiring Soon!</AlertTitle>
            <AlertDescription>
                Your rental for Locker #{myLocker.id} will expire in <strong>{timeLeft}</strong>. Please return it to avoid penalty charges.
            </AlertDescription>
        </Alert>
    )
  }

  return null;
}
