export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored in client-side state in a real app
};

export type LockerStatus = 'available' | 'rented' | 'overdue' | 'maintenance';

export type Locker = {
  id: number;
  status: LockerStatus;
  rentedBy: string | null;
  rentalDate: string | null;
  dueDate: string | null;
  accessLog: { timestamp: string }[];
};

export type AuditLogEntry = {
  timestamp: string;
  user: string | null;
  action: string;
  details: Record<string, any>;
};
