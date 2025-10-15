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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocker } from "@/hooks/use-locker";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type RentalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockerId: number;
};

export default function RentalDialog({ open, onOpenChange, lockerId }: RentalDialogProps) {
  const { rentLocker, currentUser } = useLocker();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [isRenting, setIsRenting] = useState(false);

  const handleRent = () => {
    if (!currentUser) return;
    setIsRenting(true);
    // Simulate payment processing
    setTimeout(() => {
      rentLocker(lockerId, currentUser.id);
      toast({
        title: "Locker Rented!",
        description: `You have successfully rented locker #${lockerId}.`,
      });
      setIsRenting(false);
      onOpenChange(false);
      setAgreed(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rent Locker #{lockerId}</DialogTitle>
          <DialogDescription>
            Confirm your rental for a 30-day period. A mock payment will be processed.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            By renting this locker, you agree to the terms of liability. The rental period is 30 days. Late returns may incur a penalty.
          </p>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I accept the terms and conditions
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRenting}>Cancel</Button>
          <Button onClick={handleRent} disabled={!agreed || isRenting}>
            {isRenting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRenting ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}