import mongoose from 'mongoose';

const BookingEditRequestSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    requesterId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.BookingEditRequest || mongoose.model('BookingEditRequest', BookingEditRequestSchema);