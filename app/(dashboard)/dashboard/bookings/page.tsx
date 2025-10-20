"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
// import Link from "next/link";
import { BookingList } from "@/components/BookingList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/BookingForm";

export default function BookingsPage() {
  const { getToken } = useAuth();
  const { setBookings, isLoading, setLoading } = useBookingStore();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch("/api/bookings", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        setBookings(data);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [getToken, setBookings, setLoading]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="button">New Booking</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Booking</DialogTitle>
            </DialogHeader>
            <BookingForm onSuccess={() => {}} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <BookingList />
      )}
    </div>
  );
}
