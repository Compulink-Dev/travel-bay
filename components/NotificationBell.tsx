"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  bookingId: string;
  bookingEditRequestId: string;
  requesterId: string;
  requesterName: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    reason?: string;
  };
}

export function NotificationBell() {
  const { user } = useUser();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Notification | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      // Show toast for new notifications
      if (notification.type === "edit_approved") {
        toast.success("You can now edit the booking");
      } else if (notification.type === "edit_rejected") {
        toast.error("Edit request was declined");
      }
    };

    const handleEditPermissionGranted = (data: {
      bookingId: string;
      notification: Notification;
    }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      // Refresh bookings to get updated permissions
      window.dispatchEvent(new Event("bookingsUpdated"));
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("edit-permission-granted", handleEditPermissionGranted);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("edit-permission-granted", handleEditPermissionGranted);
    };
  }, [socket, user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/bookings/edit-requests/${selectedRequest.bookingEditRequestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "approved" }),
        }
      );

      if (response.ok) {
        toast.success("Edit request approved");
        setSelectedRequest(null);
        await fetchNotifications();
        window.dispatchEvent(new Event("bookingsUpdated"));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to approve request");
      }
    } catch (error) {
      console.log("Failed to approve request : ", error);
      toast.error("Failed to approve request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/bookings/edit-requests/${selectedRequest.bookingEditRequestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "rejected" }),
        }
      );

      if (response.ok) {
        toast.success("Edit request declined");
        setSelectedRequest(null);
        await fetchNotifications();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to decline request");
      }
    } catch (error) {
      console.log("Failed to decline request : ", error);
      toast.error("Failed to decline request");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getDisplayMessage = (notification: Notification) => {
    switch (notification.type) {
      case "edit_request":
        return `${notification.requesterName} wants to edit a booking`;
      case "edit_approved":
        return `You can now edit ${notification.requesterName}'s booking`;
      case "edit_rejected":
        return `${notification.requesterName} declined your edit request`;
      default:
        return notification.message;
    }
  };

  const getDisplayTitle = (notification: Notification) => {
    switch (notification.type) {
      case "edit_request":
        return "Edit Request";
      case "edit_approved":
        return "Request Approved";
      case "edit_rejected":
        return "Request Declined";
      default:
        return notification.title;
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <div className="flex items-center gap-2">
              {isConnected && (
                <div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  title="Connected"
                />
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-auto p-1"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className="p-3 cursor-pointer flex flex-col items-start gap-1"
                  onClick={() => {
                    if (
                      notification.type === "edit_request" &&
                      !notification.isRead
                    ) {
                      setSelectedRequest(notification);
                      markAsRead([notification._id]);
                    }
                  }}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getDisplayTitle(notification)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getDisplayMessage(notification)}
                      </p>
                      {notification.metadata?.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {notification.metadata.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Request Approval Dialog */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              {selectedRequest?.requesterName} wants to edit a booking
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Requester:</span>
                  <div>{selectedRequest.requesterName}</div>
                </div>
                <div>
                  <span className="font-medium">Booking ID:</span>
                  <div className="font-mono text-xs">
                    {selectedRequest.bookingId.slice(-8)}...
                  </div>
                </div>
                {selectedRequest.metadata?.reason && (
                  <div className="col-span-2">
                    <span className="font-medium">Reason:</span>
                    <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                      {selectedRequest.metadata.reason}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handleRejectRequest}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={handleApproveRequest}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
