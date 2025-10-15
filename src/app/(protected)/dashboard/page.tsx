
"use client";

import { useLocker } from "@/hooks/use-locker";
import LockerGrid from "@/components/dashboard/locker-grid";
import OverdueWarning from "@/components/dashboard/overdue-warning";

export default function DashboardPage() {
  const { currentUser } = useLocker();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Welcome, {currentUser?.name.split(" ")[0]}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        View available lockers, manage your rental, and get access codes.
      </p>
      <div className="mt-8 space-y-8">
        <OverdueWarning />
        <LockerGrid />
      </div>
    </div>
  );
}
