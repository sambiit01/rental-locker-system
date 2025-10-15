
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
import { KeyRound, RotateCcw, CheckCircle, ShieldAlert } from "lucide-react";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";

type AccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locker: Locker;
  onReturnClick: () => void;
};

const OTP_DURATION = 30; // seconds

export default function AccessDialog({ open, onOpenChange, locker, onReturnClick }: AccessDialogProps) {
  const { generateAccessCode } = useLocker();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [timer, setTimer] = useState(OTP_DURATION);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && accessCode && !accessGranted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setAccessCode(null);
    }
    return () => clearInterval(interval);
  }, [open, accessCode, timer, accessGranted]);

  const handleGenerateCode = () => {
    const code = generateAccessCode(locker.id);
    setAccessCode(code);
    setTimer(OTP_DURATION);
    setAccessGranted(false);
    setUserInput("");
    toast({
      title: "Code Generated",
      description: `Your one-time code is ${code}. It expires in ${OTP_DURATION} seconds.`,
    });
  };
  
  const handleVerifyCode = () => {
    if (userInput === accessCode) {
      setAccessGranted(true);
      toast({
        title: "Access Granted",
        description: "Locker unlocked successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The code you entered is incorrect.",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setAccessCode(null);
      setAccessGranted(false);
      setUserInput("");
    }, 300);
  };

  const renderContent = () => {
    if (accessGranted) {
      return (
        <div className="space-y-4 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <p className="text-2xl font-bold text-foreground">Access Granted</p>
          <p className="text-muted-foreground">You can now open your locker.</p>
        </div>
      );
    }
    if (accessCode) {
      return (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Enter the code we generated. It expires in {timer}s.
          </p>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="••••••"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <Button onClick={handleVerifyCode}>Verify</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Generate a temporary code to unlock your locker.</p>
        <Button onClick={handleGenerateCode} size="lg">
          <KeyRound className="mr-2 h-4 w-4" />
          Get Access Code
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Locker #{locker.id} Control</DialogTitle>
          <DialogDescription>
            Due in {locker.dueDate ? formatDistanceToNow(new Date(locker.dueDate)) : "N/A"}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
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
  );
}
