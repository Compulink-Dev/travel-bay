import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  approvedEditors: {
    type: [String],
    default: [],
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['hotel', 'flight', 'package'],
    required: true,
  },
  hotelName: String,
  flightNumber: String,
  packageName: String,
  // Travel details
  travelDate: Date,
  destinations: [String],
  hotelOrResort: String,
  numberOfClients: Number,
  checkIn: Date,
  checkOut: Date,
  flightDate: Date,
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    childrenAges: { type: [Number], default: [] },
  },
  rooms: Number,
  activities: { type: [String], default: [] },
  otherServices: String,
  // Payments
  costs: Number,
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: { type: Number, default: 0 },
  datePaid: Date,
  paymentMethod: String,
  balance: Number,
  paymentDueDate: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  // Documents
  documents: {
    type: [
      {
        name: String,
        url: String,
        type: String,
        sizeBytes: Number,
      },
    ],
    default: [],
  },
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);