"use client";

import { useLocker } from "@/hooks/use-locker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LockerStatus } from "@/lib/types";

const statusColors: Record<LockerStatus, string> = {
  available: "bg-green-500",
  rented: "bg-blue-500",
  overdue: "bg-red-500",
  maintenance: "bg-yellow-500",
};


export default function AdminPage() {
  const { users, lockers, waitlist, auditLog } = useLocker();

  return (
    <div className="container mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{users.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rented Lockers</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{lockers.filter(l => l.status === 'rented' || l.status === 'overdue').length} / {lockers.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Waitlist</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{waitlist.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overdue Lockers</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{lockers.filter(l => l.status === 'overdue').length}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Locker Status Overview</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locker ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockers.map(locker => (
                    <TableRow key={locker.id}>
                      <TableCell>{locker.id}</TableCell>
                      <TableCell>
                        <Badge variant={locker.status === 'available' ? 'secondary' : locker.status === 'overdue' ? 'destructive' : 'default'}>
                          {locker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{locker.rentedBy || "N/A"}</TableCell>
                      <TableCell>{locker.dueDate ? format(new Date(locker.dueDate), "PP") : "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(log.timestamp), "Pp")}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
