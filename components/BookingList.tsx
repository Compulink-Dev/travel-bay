"use client";

import { useState } from "react";
import { useBookingStore } from "@/store/booking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/BookingForm";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingListProps {
  type?: "hotel" | "flight" | "package";
}

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

export function BookingList({ type }: BookingListProps) {
  const { bookings, deleteBooking } = useBookingStore();
  const { user } = useUser();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);

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

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString();

  // Check if user can edit a specific booking
  const canEditBooking = (booking: Booking) => {
    if (!user) return false;
    return (
      booking.userId === user.id ||
      (booking.approvedEditors && booking.approvedEditors.includes(user.id))
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (response.ok) {
        deleteBooking(id);
        toast.success("Booking deleted");
      } else {
        const err = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(err.error || "Failed to delete booking");
      }
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  // Fetch detailed booking info when edit is clicked
  const fetchBookingDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      if (response.ok) {
        const booking = await response.json();
        setBookingDetails(booking);
        return booking;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fetch booking details");
        return null;
      }
    } catch (error) {
      console.log("Failed to fetch booking details : ", error);
      toast.error("Failed to fetch booking details");
      return null;
    }
  };

  const handleEditClick = async (bookingId: string) => {
    setSelectedId(bookingId);
    const booking = await fetchBookingDetails(bookingId);

    if (booking && canEditBooking(booking)) {
      setEditOpen(true);
    } else if (booking) {
      // User doesn't have edit permission, show request dialog
      setEditOpen(true);
    }
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "customerEmail",
      header: "Contact",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div>
            <div className="text-sm">{booking.customerEmail}</div>
            <div className="text-xs text-muted-foreground">
              {booking.customerPhone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div>
            {booking.type === "hotel" && booking.hotelName}
            {booking.type === "flight" && booking.flightNumber}
            {booking.type === "package" && booking.packageName}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const paymentStatus = row.getValue("paymentStatus") as string;
        return (
          <Badge
            variant="outline"
            className={getPaymentStatusColor(paymentStatus)}
          >
            {paymentStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: "access",
      header: "Access",
      cell: ({ row }) => {
        const booking = row.original;
        return canEditBooking(booking) ? (
          <UserCheck className="h-4 w-4 text-green-600" />
        ) : (
          <UserX className="h-4 w-4 text-gray-400" />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedId(booking._id);
                  setViewOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(booking._id)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              {booking.userId === user?.id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(booking._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (filteredBookings.length === 0) {
    return <p className="text-muted-foreground">No bookings found.</p>;
  }

  const selected = selectedId
    ? bookings.find((b) => b._id === selectedId) || null
    : null;

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredBookings}
        searchKey="customerName"
        searchPlaceholder="Filter bookings..."
      />

      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onOpenChange={(o) => {
          setViewOpen(o);
          if (!o) setSelectedId(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Destinations</div>
                <div>{(selected.destinations || []).join(", ") || "—"}</div>
              </div>
              <div>
                <div className="font-medium">Hotel / Resort</div>
                <div>{selected.hotelOrResort || selected.hotelName || "—"}</div>
              </div>
              <div>
                <div className="font-medium">Travel Date</div>
                <div>
                  {selected.travelDate ? formatDate(selected.travelDate) : "—"}
                </div>
              </div>
              <div>
                <div className="font-medium">Guests</div>
                <div>
                  {selected.numberOfClients ||
                    (selected.guests?.adults || 0) +
                      (selected.guests?.children || 0)}{" "}
                  total • {selected.guests?.adults} adults,{" "}
                  {selected.guests?.children} children{" "}
                  {selected.guests?.childrenAges &&
                  selected.guests.childrenAges.length
                    ? `(${selected.guests.childrenAges.join(", ")})`
                    : ""}
                </div>
              </div>
              <div>
                <div className="font-medium">Activities</div>
                <div>{(selected.activities || []).join(", ") || "—"}</div>
              </div>
              <div>
                <div className="font-medium">Other Services</div>
                <div>{selected.otherServices || "—"}</div>
              </div>
              <div>
                <div className="font-medium">Customer</div>
                <div>{selected.customerName}</div>
                <div className="text-muted-foreground">
                  {selected.customerEmail} • {selected.customerPhone}
                </div>
              </div>
              <div>
                <div className="font-medium">Type</div>
                <div className="capitalize">{selected.type}</div>
              </div>
              {selected.hotelName && (
                <div>
                  <span className="font-medium">Hotel: </span>
                  {selected.hotelName}
                </div>
              )}
              {selected.flightNumber && (
                <div>
                  <span className="font-medium">Flight: </span>
                  {selected.flightNumber}
                </div>
              )}
              {selected.packageName && (
                <div>
                  <span className="font-medium">Package: </span>
                  {selected.packageName}
                </div>
              )}
              <div>
                <div className="font-medium">Status</div>
                <Badge
                  variant="outline"
                  className={getStatusColor(selected.status)}
                >
                  {selected.status}
                </Badge>
              </div>
              <div>
                <div className="font-medium">Payment</div>
                <Badge
                  variant="outline"
                  className={getPaymentStatusColor(selected.paymentStatus)}
                >
                  {selected.paymentStatus}
                </Badge>
              </div>
              <div>
                <div className="font-medium">Costs</div>
                <div>${selected.costs ?? 0}</div>
              </div>
              <div>
                <div className="font-medium">Total Amount</div>
                <div>${selected.totalAmount}</div>
              </div>
              <div>
                <div className="font-medium">Amount Paid</div>
                <div>
                  ${selected.amountPaid ?? 0}{" "}
                  {selected.datePaid
                    ? `on ${formatDate(selected.datePaid)}`
                    : ""}
                </div>
              </div>
              <div>
                <div className="font-medium">Payment</div>
                <div>{selected.paymentMethod || "—"}</div>
              </div>
              <div>
                <div className="font-medium">Balance</div>
                <div>
                  ${selected.balance ?? 0}{" "}
                  {selected.paymentDueDate
                    ? `(due ${formatDate(selected.paymentDueDate)})`
                    : ""}
                </div>
              </div>
              <div>
                <div className="font-medium">Created</div>
                <div>{formatDate(selected.createdAt)}</div>
              </div>
              {selected.documents && selected.documents.length > 0 && (
                <div className="md:col-span-2">
                  <div className="font-medium">Documents</div>
                  <ul className="list-disc pl-4">
                    {selected.documents.map((d, i) => (
                      <li key={i}>
                        <a
                          href={d.url}
                          className="text-primary underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {d.name || d.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.notes && (
                <div className="md:col-span-2">
                  <div className="font-medium">Notes</div>
                  <div>{selected.notes}</div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) {
            setSelectedId(null);
            setBookingDetails(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {selected ? (
            canEditBooking(bookingDetails || selected) ? (
              <BookingForm
                initialData={bookingDetails || selected}
                method="PUT"
                submitUrl={`/api/bookings/${selected._id}`}
                onSuccess={() => {
                  setEditOpen(false);
                  setSelectedId(null);
                  setBookingDetails(null);
                  // Refresh the bookings list
                  window.dispatchEvent(new Event("bookingsUpdated"));
                }}
              />
            ) : (
              <div className="space-y-4 p-4 text-center">
                <UserX className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Edit Permission Required
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {`  You don't have permission to edit this booking. Request
                    access from the booking owner.`}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/bookings/${selected._id}/edit-requests`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              reason: "I need to update booking details",
                            }),
                          }
                        );

                        if (response.ok) {
                          toast.success("Edit request sent to booking owner");
                          setEditOpen(false);
                        } else {
                          const error = await response.json();
                          toast.error(error.error || "Failed to send request");
                        }
                      } catch (error) {
                        console.log("Failed to send edit request :", error);
                        toast.error("Failed to send edit request");
                      }
                    }}
                  >
                    Request Edit Access
                  </Button>
                </div>
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
