import mongoose from 'mongoose';

const BookingActivitySchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: String, required: true, index: true },
    action: { type: String, enum: ['create','update','delete','request_edit','approve_edit','reject_edit'], required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.BookingActivity || mongoose.model('BookingActivity', BookingActivitySchema);