import { z } from "zod";

export const BookingFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(1, "Phone number is required"),
  type: z.enum(["hotel", "flight", "package"]),
  hotelName: z.string().optional(),
  flightNumber: z.string().optional(),
  packageName: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  flightDate: z.date().optional(),
  guests: z.object({
    adults: z.number().min(1, "At least one adult required"),
    children: z.number().min(0),
  }),
  rooms: z.number().min(1, "At least one room required").optional(),
  totalAmount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]),
  notes: z.string().optional(),
});

export const CustomerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
  preferences: z.object({
    smoking: z.boolean().default(false),
    petFriendly: z.boolean().default(false),
    specialNeeds: z.string().optional(),
  }),
});

export const TodoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  completed: z.boolean().default(false),
});

export const LeadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  status: z.enum(["new", "contacted", "won", "lost"]).default("new"),
  notes: z.string().optional(),
});

export const HotelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const TravelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type BookingFormData = z.infer<typeof BookingFormSchema>;
export type CustomerFormData = z.infer<typeof CustomerFormSchema>;
export type TodoFormData = z.infer<typeof TodoFormSchema>;
export type LeadFormData = z.infer<typeof LeadFormSchema>;
export type HotelFormData = z.infer<typeof HotelFormSchema>;
export type TravelFormData = z.infer<typeof TravelFormSchema>;
