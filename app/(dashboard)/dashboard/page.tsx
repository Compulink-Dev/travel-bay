"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useBookingStore } from "@/store/booking-store";
import { BookingForm } from "@/components/BookingForm";
import { BookingList } from "@/components/BookingList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

interface Booking {
  _id: string;
  userId: string;
  approvedEditors?: string[];
  creatorName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: "hotel" | "flight" | "package";
  hotelName?: string;
  flightNumber?: string;
  packageName?: string;
  travelDate?: Date;
  destinations?: string[];
  hotelOrResort?: string;
  numberOfClients?: number;
  checkIn?: Date;
  checkOut?: Date;
  flightDate?: Date;
  guests: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };
  rooms?: number;
  activities?: string[];
  otherServices?: string;
  costs?: number;
  totalAmount: number;
  amountPaid?: number;
  datePaid?: Date;
  paymentMethod?: string;
  balance?: number;
  paymentDueDate?: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  documents?: {
    name: string;
    url: string;
    type?: string;
    sizeBytes?: number;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { socket, isConnected } = useSocket();
  const { getToken } = useAuth();
  const {
    bookings,
    setBookings,
    isLoading,
    setLoading,
    addBooking,
    updateBooking,
    deleteBooking,
  } = useBookingStore();
  const [showForm, setShowForm] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else if (response.status === 401) {
        console.error("Unauthorized - please sign in again");
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, setBookings, setLoading]);

  useEffect(() => {
    if (isLoaded) {
      fetchBookings();
    }
  }, [isLoaded, fetchBookings]);

  // Listen for real-time booking updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleBookingCreated = (booking: Booking) => {
      addBooking(booking);
      toast.success("New booking created");
    };

    const handleBookingUpdated = (booking: Booking) => {
      updateBooking(booking._id, booking);
      toast.info("Booking updated");
    };

    const handleBookingDeleted = (bookingId: string) => {
      deleteBooking(bookingId);
      toast.warning("Booking deleted");
    };

    socket.on("booking-created", handleBookingCreated);
    socket.on("booking-updated", handleBookingUpdated);
    socket.on("booking-deleted", handleBookingDeleted);

    return () => {
      socket.off("booking-created", handleBookingCreated);
      socket.off("booking-updated", handleBookingUpdated);
      socket.off("booking-deleted", handleBookingDeleted);
    };
  }, [socket, user, addBooking, updateBooking, deleteBooking]);

  // Add this effect to listen for booking updates from other components
  useEffect(() => {
    const handleBookingsUpdate = () => {
      fetchBookings();
    };

    window.addEventListener("bookingsUpdated", handleBookingsUpdate);

    return () => {
      window.removeEventListener("bookingsUpdated", handleBookingsUpdate);
    };
  }, [fetchBookings]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Travel Bay Dashboard</h1>
          {isConnected ? (
            <div
              className="w-3 h-3 bg-green-500 rounded-full"
              title="Real-time connected"
            />
          ) : (
            <div
              className="w-3 h-3 bg-yellow-500 rounded-full"
              title="Real-time disconnected"
            />
          )}
        </div>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.username}!
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Booking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <BookingForm
              onSuccess={() => {
                fetchBookings();
                toast.success("Booking created successfully");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
            <CardDescription>
              Add a new hotel, flight, or package booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm
              onSuccess={() => {
                setShowForm(false);
                fetchBookings();
                toast.success("Booking created successfully");
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.revenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="hotel">Hotels</TabsTrigger>
              <TabsTrigger value="flight">Flights</TabsTrigger>
              <TabsTrigger value="package">Packages</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <BookingList />
            </TabsContent>

            <TabsContent value="hotel" className="space-y-4">
              <BookingList type="hotel" />
            </TabsContent>

            <TabsContent value="flight" className="space-y-4">
              <BookingList type="flight" />
            </TabsContent>

            <TabsContent value="package" className="space-y-4">
              <BookingList type="package" />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
