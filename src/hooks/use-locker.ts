"use client";

import { useContext } from "react";
import { LockerContext } from "@/contexts/LockerContext";

export const useLocker = () => {
  const context = useContext(LockerContext);
  if (context === undefined) {
    throw new Error("useLocker must be used within a LockerProvider");
  }
  return context;
};
