
"use client";

import type { ReactNode } from "react";
import { createContext, useState, useEffect, useCallback } from "react";
import { User, Locker, AuditLogEntry, LockerStatus } from "@/lib/types";
import { addMinutes, formatISO } from 'date-fns';

const TOTAL_LOCKERS = 20;
const RENTAL_DURATION_MINUTES = 2;

type LockerContextType = {
  loading: boolean;
  currentUser: User | null;
  users: User[];
  lockers: Locker[];
  waitlist: string[];
  auditLog: AuditLogEntry[];
  login: (email: string, password: string) => Promise<User>;
  register: (user: Omit<User, 'id'> & { id: string, password: any }) => Promise<User>;
  logout: () => void;
  rentLocker: (lockerId: number, userId: string) => void;
  returnLocker: (lockerId: number, userId: string) => { penalty: number };
  forceReturnLocker: (lockerId: number) => { penalty: number };
  generateAccessCode: (lockerId: number) => string;
  addToWaitlist: (email: string) => void;
};

export const LockerContext = createContext<LockerContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const initialLockers: Locker[] = Array.from({ length: TOTAL_LOCKERS }, (_, i) => ({
  id: i + 1,
  status: 'available' as LockerStatus,
  rentedBy: null,
  rentalDate: null,
  dueDate: null,
  accessLog: [],
}));


export function LockerProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [waitlist, setWaitlist] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setUsers(getInitialState('locker_users', []));
    setLockers(getInitialState('locker_lockers', initialLockers));
    setWaitlist(getInitialState('locker_waitlist', []));
    setAuditLog(getInitialState('locker_audit_log', []));
    const storedUser = getInitialState('locker_currentUser', null);
    if (storedUser) {
        setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('locker_users', JSON.stringify(users));
      localStorage.setItem('locker_lockers', JSON.stringify(lockers));
      localStorage.setItem('locker_waitlist', JSON.stringify(waitlist));
      localStorage.setItem('locker_audit_log', JSON.stringify(auditLog));
      localStorage.setItem('locker_currentUser', JSON.stringify(currentUser));
    }
  }, [users, lockers, waitlist, auditLog, currentUser, loading]);

  const addAuditLog = useCallback((user: string | null, action: string, details: Record<string, any>) => {
    const newLogEntry: AuditLogEntry = {
      timestamp: formatISO(new Date()),
      user,
      action,
      details,
    };
    setAuditLog(prev => [newLogEntry, ...prev]);
  }, []);
  
  // Daily check for overdue lockers
  useEffect(() => {
    if (loading) return;

    const checkOverdue = () => {
      const now = new Date();
      let lockersChanged = false;
      const updatedLockers = lockers.map(locker => {
        if (locker.status === 'rented' && locker.dueDate && new Date(locker.dueDate) < now) {
          if (locker.status !== 'overdue') {
            addAuditLog('SYSTEM', 'LOCKER_OVERDUE', { lockerId: locker.id, studentId: locker.rentedBy });
            lockersChanged = true;
          }
          return { ...locker, status: 'overdue' as LockerStatus };
        }
        return locker;
      });

      if (lockersChanged) {
        setLockers(updatedLockers);
      }
    };

    const interval = setInterval(checkOverdue, 1000 * 30); // Check every 30 seconds
    checkOverdue(); // Initial check
    return () => clearInterval(interval);
  }, [loading, addAuditLog, lockers]);

  const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const { password, ...userToStore } = user;
        setCurrentUser(userToStore);
        addAuditLog(user.email, 'LOGIN_SUCCESS', {});
        resolve(userToStore);
      } else {
        addAuditLog(email, 'LOGIN_FAIL', {});
        reject(new Error("Invalid email or password."));
      }
    });
  };

  const register = (newUser: Omit<User, 'id'> & {id: string, password: any}): Promise<User> => {
    return new Promise((resolve, reject) => {
      if (users.some(u => u.email === newUser.email)) {
        return reject(new Error("An account with this email already exists."));
      }
      if (users.some(u => u.id === newUser.id)) {
        return reject(new Error("An account with this Student ID already exists."));
      }
      setUsers(prev => [...prev, newUser]);
      addAuditLog(newUser.email, 'REGISTER_SUCCESS', { studentId: newUser.id });
      // Automatically log in user after registration
      const { password, ...userToStore } = newUser;
      setCurrentUser(userToStore);
      resolve(userToStore);
    });
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog(currentUser.email, 'LOGOUT', {});
      setCurrentUser(null);
    }
  };

  const rentLocker = (lockerId: number, userId: string) => {
    const locker = lockers.find(l => l.id === lockerId);
    if (locker && locker.status === 'available') {
      const rentalDate = new Date();
      const dueDate = addMinutes(rentalDate, RENTAL_DURATION_MINUTES);
      const updatedLockers = lockers.map(l =>
        l.id === lockerId
          ? {
              ...l,
              status: 'rented' as LockerStatus,
              rentedBy: userId,
              rentalDate: formatISO(rentalDate),
              dueDate: formatISO(dueDate),
            }
          : l
      );
      setLockers(updatedLockers);
      addAuditLog(currentUser?.email || 'unknown', 'RENT_LOCKER', { lockerId, studentId: userId });
    }
  };

  const performReturn = (lockerId: number, studentId: string | null, actor: string) => {
    let penalty = 0;
    const locker = lockers.find(l => l.id === lockerId);
    if (locker && (locker.rentedBy === studentId || actor === 'ADMIN')) {
        if (locker.status === 'overdue') {
            penalty = 20; // Mock penalty
        }

        const updatedLockers = lockers.map(l => 
            l.id === lockerId 
            ? { ...initialLockers.find(il => il.id === lockerId)! } // Reset to initial state
            : l
        );

        setLockers(updatedLockers);
        addAuditLog(currentUser?.email || 'unknown', actor === 'ADMIN' ? 'FORCE_RETURN_LOCKER' : 'RETURN_LOCKER', { lockerId, studentId: locker.rentedBy, penalty });

        // Check waitlist
        if (waitlist.length > 0) {
            const nextInLine = waitlist[0];
            addAuditLog('SYSTEM', 'NOTIFY_WAITLIST', { notifiedEmail: nextInLine });
            setWaitlist(prev => prev.slice(1));
        }

        return { penalty };
    }
    return { penalty: 0 };
  }

  const returnLocker = (lockerId: number, userId: string) => {
    return performReturn(lockerId, userId, 'USER');
  };

  const forceReturnLocker = (lockerId: number) => {
    const locker = lockers.find(l => l.id === lockerId);
    return performReturn(lockerId, locker?.rentedBy || null, 'ADMIN');
  };
  
  const generateAccessCode = (lockerId: number) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const updatedLockers = lockers.map(l =>
        l.id === lockerId
          ? { ...l, accessLog: [...l.accessLog, { timestamp: formatISO(new Date()) }] }
          : l
      );
      setLockers(updatedLockers);
      addAuditLog(currentUser?.email || 'unknown', 'GENERATE_ACCESS_CODE', { lockerId });
      return code;
  };

  const addToWaitlist = (email: string) => {
      if (!waitlist.includes(email)) {
          setWaitlist(prev => [...prev, email]);
          addAuditLog(email, 'JOIN_WAITLIST', {});
      }
  };

  const value = {
    loading,
    currentUser,
    users,
    lockers,
    waitlist,
    auditLog,
    login,
    register,
    logout,
    rentLocker,
    returnLocker,
    forceReturnLocker,
    generateAccessCode,
    addToWaitlist
  };

  return (
    <LockerContext.Provider value={value}>
      {children}
    </LockerContext.Provider>
  );
}
