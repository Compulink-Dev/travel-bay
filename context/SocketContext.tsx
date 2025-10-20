"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Only connect in browser environment
    if (typeof window === "undefined") return;

    const socketInstance = io(
      process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://localhost:3000",
      {
        path: "/api/socketio",
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socketInstance.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isLoaded]);

  // Join user room when user is available
  useEffect(() => {
    if (socket && user && isConnected) {
      socket.emit("join-user-room", user.id);
      console.log(`Joined user room: user:${user.id}`);
    }
  }, [socket, user, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
