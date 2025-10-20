import { create } from 'zustand';

interface Booking {
  _id: string;
  userId: string;
  creatorName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'hotel' | 'flight' | 'package';
  hotelName?: string;
  flightNumber?: string;
  packageName?: string;
  checkIn?: Date;
  checkOut?: Date;
  flightDate?: Date;
  guests: {
    adults: number;
    children: number;
  };
  rooms?: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  filters: {
    type: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  
  // Actions
  setBookings: (bookings: Booking[]) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<BookingState['filters']>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>((set, _get) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  filters: {
    type: '',
    status: '',
    startDate: null,
    endDate: null,
  },

  setBookings: (bookings) => set({ bookings }),
  setSelectedBooking: (selectedBooking) => set({ selectedBooking }),
  setLoading: (isLoading) => set({ isLoading }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings]
  })),

  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map(booking =>
      booking._id === id ? { ...booking, ...updates } : booking
    ),
    selectedBooking: state.selectedBooking?._id === id 
      ? { ...state.selectedBooking, ...updates }
      : state.selectedBooking
  })),

  deleteBooking: (id) => set((state) => ({
    bookings: state.bookings.filter(booking => booking._id !== id),
    selectedBooking: state.selectedBooking?._id === id ? null : state.selectedBooking
  })),
}));