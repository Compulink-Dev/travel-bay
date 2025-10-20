import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import BookingEditRequest from '@/models/BookingEditRequest';
import Booking from '@/models/Booking';
import BookingActivity from '@/models/BookingActivity';
import Notification from '@/models/Notifications';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { requestId } = await params;
  const body = await request.json();
  const action: 'approved' | 'rejected' = body.action;

  const req = await BookingEditRequest.findById(requestId).populate('bookingId');
  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  if (req.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  req.status = action;
  await req.save();

  // Create notification for requester
  await Notification.create({
    userId: req.requesterId,
    type: action === 'approved' ? 'edit_approved' : 'edit_rejected',
    title: action === 'approved' ? 'Edit Request Approved' : 'Edit Request Rejected',
    message: `${user.firstName} ${user.lastName} ${action} your edit request for booking ${req.bookingId}`,
    bookingId: req.bookingId,
    bookingEditRequestId: req._id,
    requesterId: user.id,
    requesterName: `${user.firstName} ${user.lastName}`,
  });

  if (action === 'approved') {
    await Booking.findByIdAndUpdate(req.bookingId, { $addToSet: { approvedEditors: req.requesterId } });
    await BookingActivity.create({ 
      bookingId: req.bookingId, 
      userId: user.id, 
      action: 'approve_edit', 
      details: { requesterId: req.requesterId } 
    });
  } else {
    await BookingActivity.create({ 
      bookingId: req.bookingId, 
      userId: user.id, 
      action: 'reject_edit', 
      details: { requesterId: req.requesterId } 
    });
  }

  return NextResponse.json(req);
}