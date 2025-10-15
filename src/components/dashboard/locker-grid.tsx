"use client";

import { useLocker } from "@/hooks/use-locker";
import LockerItem from "./locker-item";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Info } from "lucide-react";

export default function LockerGrid() {
  const { lockers, waitlist, currentUser, addToWaitlist } = useLocker();
  const { toast } = useToast();

  const myLockers = lockers.filter(
    (l) => l.rentedBy === currentUser?.id
  );
  const availableLockers = lockers.filter((l) => l.status === "available");
  const otherRentedLockers = lockers.filter(
    (l) => l.status === "rented" && l.rentedBy !== currentUser?.id
  );

  const handleJoinWaitlist = () => {
    if (currentUser) {
      if (waitlist.includes(currentUser.email)) {
        toast({
          title: "Already on Waitlist",
          description: "You are already on the waitlist. We'll notify you when a locker is free.",
          variant: "default",
        });
      } else {
        addToWaitlist(currentUser.email);
        toast({
          title: "Joined Waitlist!",
          description: "You've been added to the waitlist.",
        });
      }
    }
  };

  const rentedLocker = myLockers.length > 0;

  return (
    <div className="space-y-8">
      {rentedLocker && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your Locker</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {myLockers.map((locker) => (
              <LockerItem key={locker.id} locker={locker} />
            ))}
          </div>
        </div>
      )}

      {availableLockers.length > 0 && !rentedLocker && (
         <div>
          <h2 className="text-2xl font-semibold tracking-tight">Available Lockers</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {availableLockers.map((locker) => (
              <LockerItem key={locker.id} locker={locker} />
            ))}
          </div>
        </div>
      )}

      {availableLockers.length === 0 && !rentedLocker && (
        <Alert className="max-w-md bg-accent/30">
          <Users className="h-4 w-4" />
          <AlertTitle>No Lockers Available</AlertTitle>
          <AlertDescription>
            All lockers are currently rented. You can join the waitlist to be
            notified when one becomes free.
            <Button onClick={handleJoinWaitlist} className="mt-4 w-full">Join Waitlist</Button>
          </AlertDescription>
        </Alert>
      )}

      {otherRentedLockers.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Other Rented Lockers</h2>
           <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {otherRentedLockers.map((locker) => (
              <LockerItem key={locker.id} locker={locker} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
