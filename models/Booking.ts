import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
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
  checkIn: Date,
  checkOut: Date,
  flightDate: Date,
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
  },
  rooms: Number,
  totalAmount: {
    type: Number,
    required: true,
  },
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
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);