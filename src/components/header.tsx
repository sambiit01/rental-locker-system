"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocker } from "@/hooks/use-locker";
import { LockerLeaseLogo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { currentUser, logout } = useLocker();
  const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar");
  const userInitials =
    currentUser?.name
      .split(" ")
      .map((n) => n[0])
      .join("") || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 md:px-8">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <LockerLeaseLogo className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            LockerLease
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar?.imageUrl} alt={currentUser?.name} data-ai-hint={userAvatar?.imageHint} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
