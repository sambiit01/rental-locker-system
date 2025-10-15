"use client";

import { useLocker } from "@/hooks/use-locker";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/header";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useLocker();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
