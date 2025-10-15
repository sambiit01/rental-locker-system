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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type ReturnDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locker: Locker;
};

export default function ReturnDialog({ open, onOpenChange, locker }: ReturnDialogProps) {
  const { returnLocker, currentUser } = useLocker();
  const { toast } = useToast();
  const isOverdue = locker.status === 'overdue';

  const handleReturn = () => {
    if (!currentUser) return;
    const { penalty } = returnLocker(locker.id, currentUser.id);
    toast({
      title: "Locker Returned",
      description: `Locker #${locker.id} is now available. ${penalty > 0 ? `A mock penalty of $${penalty} was applied.` : ''}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Return Locker #{locker.id}</DialogTitle>
          <DialogDescription>
            Are you sure you want to return this locker? Your access will be revoked immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isOverdue && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Locker Overdue</AlertTitle>
                    <AlertDescription>
                        A mock penalty of $20 will be applied for this late return.
                    </AlertDescription>
                </Alert>
            )}
            {!isOverdue && (
                <p className="text-sm text-muted-foreground">Your locker is not overdue. No penalties will be applied.</p>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReturn}>Confirm Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
