
"use client";

import { useLocker } from "@/hooks/use-locker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LockerStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


const statusColors: Record<LockerStatus, string> = {
  available: "bg-green-500",
  rented: "bg-blue-500",
  overdue: "bg-red-500",
  maintenance: "bg-yellow-500",
};


export default function AdminPage() {
  const { users, lockers, waitlist, auditLog, forceReturnLocker, updateLockerStatus } = useLocker();
  const { toast } = useToast();

  const handleForceReturn = (lockerId: number) => {
    const { penalty } = forceReturnLocker(lockerId);
    toast({
        title: "Locker Returned",
        description: `Locker #${lockerId} was forcefully returned. ${penalty > 0 ? `A mock penalty of $${penalty} was logged.` : ''}`,
    })
  }

  const handleStatusChange = (lockerId: number, status: LockerStatus) => {
    updateLockerStatus(lockerId, status);
    toast({
      title: "Locker Status Updated",
      description: `Locker #${lockerId} is now marked as ${status}.`
    });
  }

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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Locker Status Overview</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockers.map(locker => (
                    <TableRow key={locker.id}>
                      <TableCell>{locker.id}</TableCell>
                      <TableCell>
                        <Badge variant={locker.status === 'available' ? 'secondary' : locker.status === 'overdue' ? 'destructive' : locker.status === 'maintenance' ? 'outline' : 'default'}>
                          {locker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{locker.rentedBy || "N/A"}</TableCell>
                      <TableCell>{locker.dueDate ? format(new Date(locker.dueDate), "PPp") : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             {(locker.status === 'rented' || locker.status === 'overdue') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive-foreground">
                                    Force Return
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will immediately return Locker #{locker.id} and revoke access for user {locker.rentedBy}. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleForceReturn(locker.id)}>
                                      Confirm Return
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(locker.id, 'available')}>Available</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(locker.id, 'maintenance')}>Maintenance</DropdownMenuItem>
                             {locker.rentedBy && <DropdownMenuItem onClick={() => handleStatusChange(locker.id, 'rented')}>Rented</DropdownMenuItem>}
                             {locker.rentedBy && <DropdownMenuItem onClick={() => handleStatusChange(locker.id, 'overdue')}>Overdue</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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
