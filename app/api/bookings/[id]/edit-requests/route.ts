import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Booking from '@/models/Booking';
import BookingEditRequest from '@/models/BookingEditRequest';
import BookingActivity from '@/models/BookingActivity';
import Notification from '@/models/Notifications';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const booking = await Booking.findById(id).lean<{ userId: string }>();
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.userId === user.id) return NextResponse.json({ error: 'You already own this booking' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const reason = body?.reason as string | undefined;

  const existing = await BookingEditRequest.findOne({ bookingId: id, requesterId: user.id, status: 'pending' });
  if (existing) return NextResponse.json(existing);

  const created = await BookingEditRequest.create({ 
    bookingId: id, 
    requesterId: user.id, 
    ownerId: booking.userId, 
    reason 
  });

  // Create notification for booking owner
  await Notification.create({
    userId: booking.userId,
    type: 'edit_request',
    title: 'Edit Request',
    message: `${user.firstName} ${user.lastName} requested to edit booking ${id}`,
    bookingId: id,
    bookingEditRequestId: created._id,
    requesterId: user.id,
    requesterName: `${user.firstName} ${user.lastName}`,
    metadata: { reason }
  });

  await BookingActivity.create({ 
    bookingId: id, 
    userId: user.id, 
    action: 'request_edit', 
    details: { reason } 
  });
  
  return NextResponse.json(created, { status: 201 });
}