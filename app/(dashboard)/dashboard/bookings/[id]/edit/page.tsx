"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { toast } from "sonner";

export default function BookingEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  const [initial, setInitial] = useState<BookingResp | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) setInitial(await res.json());
    };
    run();
  }, [getToken, params.id]);

  if (!initial) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Booking</h1>
      <BookingForm
        initialData={initial}
        method="PUT"
        submitUrl={`/api/bookings/${params.id}`}
        onSuccess={() => {
          toast.success("Booking updated");
          router.push(`/dashboard/bookings/${params.id}`);
        }}
      />
    </div>
  );
}