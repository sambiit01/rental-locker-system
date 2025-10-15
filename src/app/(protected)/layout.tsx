"use client";

import { useLocker } from "@/hooks/use-locker";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/header";
import { Loader2 } from "lucide-react";
import { ADMIN_EMAILS } from "@/lib/constants";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useLocker();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login");
    }

    if (!loading && currentUser && pathname.startsWith('/admin')) {
      if (!ADMIN_EMAILS.includes(currentUser.email)) {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, loading, router, pathname]);

  if (loading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin access check for client-side navigation
  if (pathname.startsWith('/admin') && !ADMIN_EMAILS.includes(currentUser.email)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
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
