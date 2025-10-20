"use client";

import Link from "next/link";
import { useBookingStore } from "@/store/booking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

interface BookingListProps {
  type?: "hotel" | "flight" | "package";
}

export function BookingList({ type }: BookingListProps) {
  const { bookings, deleteBooking } = useBookingStore();

  const filteredBookings = type
    ? bookings.filter((booking) => booking.type === type)
    : bookings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (response.ok) {
        deleteBooking(id);
        toast.success("Booking deleted");
      } else {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error || "Failed to delete booking");
      }
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  if (filteredBookings.length === 0) {
    return <p className="text-muted-foreground">No bookings found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredBookings.map((booking) => (
          <TableRow key={booking._id}>
            <TableCell className="font-medium">{booking.customerName}</TableCell>
            <TableCell>
              <div className="text-sm">{booking.customerEmail}</div>
              <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
            </TableCell>
            <TableCell className="capitalize">{booking.type}</TableCell>
            <TableCell>
              {booking.type === "hotel" && booking.hotelName}
              {booking.type === "flight" && booking.flightNumber}
              {booking.type === "package" && booking.packageName}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getPaymentStatusColor(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>${booking.totalAmount}</TableCell>
            <TableCell>{booking.creatorName || "Unknown"}</TableCell>
            <TableCell>{formatDate(booking.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/bookings/${booking._id}`}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/bookings/${booking._id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(booking._id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
