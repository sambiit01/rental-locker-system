"use client";

import { useLocker } from "@/hooks/use-locker";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { currentUser, loading } = useLocker();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [currentUser, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading LockerLease...</p>
    </div>
  );
}
