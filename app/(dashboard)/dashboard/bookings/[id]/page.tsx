"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookingViewPage() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  type BookingResp = {
    _id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    type: "hotel" | "flight" | "package";
    hotelName?: string;
    flightNumber?: string;
    packageName?: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    paymentStatus: "pending" | "paid" | "refunded" | "failed";
    totalAmount: number;
    notes?: string;
    creatorName?: string;
    createdAt?: string | Date;
  };
  const [booking, setBooking] = useState<BookingResp | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) setBooking(await res.json());
    };
    run();
  }, [getToken, params.id]);

  if (!booking) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Booking Details</h1>
        <Button asChild>
          <Link href={`/dashboard/bookings/${booking._id}/edit`}>Edit</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {booking.customerName} • <span className="text-sm text-muted-foreground">{booking.creatorName || "Unknown"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div><span className="font-medium">Email:</span> {booking.customerEmail}</div>
          <div><span className="font-medium">Phone:</span> {booking.customerPhone}</div>
          <div><span className="font-medium">Type:</span> {booking.type}</div>
          {booking.hotelName && <div><span className="font-medium">Hotel:</span> {booking.hotelName}</div>}
          {booking.flightNumber && <div><span className="font-medium">Flight:</span> {booking.flightNumber}</div>}
          {booking.packageName && <div><span className="font-medium">Package:</span> {booking.packageName}</div>}
          <div><span className="font-medium">Status:</span> <Badge variant="outline">{booking.status}</Badge></div>
          <div><span className="font-medium">Payment:</span> <Badge variant="outline">{booking.paymentStatus}</Badge></div>
          <div><span className="font-medium">Amount:</span> ${booking.totalAmount}</div>
          {booking.notes && <div className="sm:col-span-2"><span className="font-medium">Notes:</span> {booking.notes}</div>}
        </CardContent>
      </Card>
    </div>
  );
}