import { NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Booking from '@/models/Booking';
import BookingActivity from '@/models/BookingActivity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const booking = await Booking.findById(id).lean<{ userId?: string }>();
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let creatorName = 'Unknown';
    try {
      const client = await clerkClient();
      const u = await client.users.getUser(booking.userId as string);
      const userAny = u as unknown as { username?: string; firstName?: string | null; lastName?: string | null };
      creatorName = userAny.username || [userAny.firstName, userAny.lastName].filter(Boolean).join(' ') || 'Unknown';
    } catch {}

    return NextResponse.json({ ...booking, creatorName });
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Use currentUser instead of getAuth for App Router
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    const existing = await Booking.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const canEdit = existing.userId === user.id || (existing.approvedEditors || []).includes(user.id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden - approval required', needsApproval: true }, { status: 403 });
    }

    const booking = await Booking.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    await BookingActivity.create({ bookingId: booking._id, userId: user.id, action: 'update', details: { body } });
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Use currentUser instead of getAuth for App Router
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const booking = await Booking.findOneAndDelete({ 
      _id: id, 
      userId: user.id 
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await BookingActivity.create({ bookingId: booking._id, userId: user.id, action: 'delete' });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
