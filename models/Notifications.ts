import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['edit_request', 'edit_approved', 'edit_rejected'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  bookingId: {
    type: String,
    required: true,
  },
  bookingEditRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingEditRequest',
  },
  requesterId: {
    type: String,
  },
  requesterName: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);