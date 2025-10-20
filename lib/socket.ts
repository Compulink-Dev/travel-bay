import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer?: NetServer) {
  if (io) return io;

  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
  };

  if (httpServer) {
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: corsOptions,
    });
  } else {
    io = new SocketIOServer({
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: corsOptions,
    });
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join booking room for real-time updates
    socket.on('join-booking-room', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}