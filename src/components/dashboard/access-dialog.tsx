"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocker } from "@/hooks/use-locker";
import type { Locker } from "@/lib/types";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { KeyRound, RotateCcw } from "lucide-react";

type AccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locker: Locker;
  onReturnClick: () => void;
};

const OTP_DURATION = 30; // seconds

export default function AccessDialog({ open, onOpenChange, locker, onReturnClick }: AccessDialogProps) {
  const { generateAccessCode } = useLocker();
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [timer, setTimer] = useState(OTP_DURATION);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (accessCode && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setAccessCode(null);
    }
    return () => clearInterval(interval);
  }, [accessCode, timer]);

  const handleGenerateCode = () => {
    const code = generateAccessCode(locker.id);
    setAccessCode(code);
    setTimer(OTP_DURATION);
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setAccessCode(null);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Locker #{locker.id} Control</DialogTitle>
          <DialogDescription>
            Due in {locker.dueDate ? formatDistanceToNow(new Date(locker.dueDate)) : "N/A"}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
            {accessCode ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Your temporary access code is:</p>
                    <p className="text-5xl font-bold tracking-widest text-primary">{accessCode}</p>
                    <p className="text-sm text-muted-foreground">This code expires in {timer}s.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-muted-foreground">Generate a temporary code to unlock your locker.</p>
                    <Button onClick={handleGenerateCode} size="lg">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Get Access Code
                    </Button>
                </div>
            )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={() => {
              handleClose();
              onReturnClick();
          }}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Return Locker
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
