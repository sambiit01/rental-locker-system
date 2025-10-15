"use client";

import type { Locker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LockKeyhole, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { useLocker } from "@/hooks/use-locker";
import { useState } from "react";
import RentalDialog from "./rental-dialog";
import AccessDialog from "./access-dialog";
import ReturnDialog from "./return-dialog";

type LockerItemProps = {
  locker: Locker;
};

const statusConfig = {
  available: {
    icon: LockKeyhole,
    label: "Available",
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-300 dark:border-green-700",
    hover: "hover:bg-green-200 dark:hover:bg-green-800",
  },
  rented: {
    icon: Lock,
    label: "Rented",
    bg: "bg-gray-200 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
    hover: "",
  },
  rented_by_me: {
    icon: UserCheck,
    label: "My Locker",
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-700",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-800",
  },
  overdue: {
    icon: AlertTriangle,
    label: "Overdue",
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300 dark:border-red-700",
    hover: "hover:bg-red-200 dark:hover:bg-red-800",
  },
};

export default function LockerItem({ locker }: LockerItemProps) {
  const { currentUser } = useLocker();
  const [dialogOpen, setDialogOpen] = useState<
    "rent" | "access" | "return" | null
  >(null);
  
  const isMyLocker = locker.rentedBy === currentUser?.id;
  const statusKey = isMyLocker
    ? locker.status === "overdue"
      ? "overdue"
      : "rented_by_me"
    : locker.status;

  const config = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.rented;
  const Icon = config.icon;

  const handleLockerClick = () => {
    if (statusKey === 'available') {
      setDialogOpen('rent');
    } else if (isMyLocker) {
      setDialogOpen('access');
    }
  }

  return (
    <>
      <button
        onClick={handleLockerClick}
        disabled={statusKey === 'rented'}
        className={cn(
          "relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200",
          config.bg,
          config.text,
          config.border,
          config.hover,
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <Icon className="h-8 w-8" />
        <span className="mt-2 text-sm font-semibold">{config.label}</span>
        <span className="absolute top-2 left-2 text-lg font-bold">
          {locker.id}
        </span>
      </button>

      <RentalDialog 
        open={dialogOpen === 'rent'} 
        onOpenChange={(open) => !open && setDialogOpen(null)}
        lockerId={locker.id}
      />
      <AccessDialog
        open={dialogOpen === 'access'}
        onOpenChange={(open) => !open && setDialogOpen(null)}
        locker={locker}
        onReturnClick={() => setDialogOpen('return')}
      />
       <ReturnDialog
        open={dialogOpen === 'return'}
        onOpenChange={(open) => !open && setDialogOpen(null)}
        locker={locker}
      />
    </>
  );
}
