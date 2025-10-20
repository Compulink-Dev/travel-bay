import { NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Booking from '@/models/Booking';
import BookingActivity from '@/models/BookingActivity';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Show ALL bookings to any authenticated user
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (status) query.status = status;

    type BookingLean = { userId?: string } & Record<string, unknown>;
    const bookings: BookingLean[] = await Booking.find(query).sort({ createdAt: -1 }).lean();

    // Attach creator username from Clerk
    const userIds = Array.from(new Set(bookings.map((b) => b.userId).filter(Boolean) as string[]));
    let usersById: Record<string, { username?: string; firstName?: string; lastName?: string }> = {};
    if (userIds.length) {
      try {
        const client = await clerkClient();
        const list = await client.users.getUserList({ userId: userIds });
        usersById = Object.fromEntries(
          list.data.map((u) => {
            const userAny = u as unknown as { id: string; username?: string; firstName?: string | null; lastName?: string | null };
            return [userAny.id, { username: userAny.username || undefined, firstName: (userAny.firstName || undefined) as string | undefined, lastName: (userAny.lastName || undefined) as string | undefined }];
          })
        );
      } catch (e) {
        console.log('Error is from : ', e);
        
        // Ignore enrichment failures
        usersById = {};
      }
    }

    const enriched = bookings.map((b) => {
      const u = b.userId ? usersById[b.userId] : undefined;
      const display = u ? (u.username || [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unknown') : 'Unknown';
      return { ...b, creatorName: display } as BookingLean & { creatorName: string };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      ...body,
      userId: user.id,
    });

    await BookingActivity.create({ bookingId: booking._id, userId: user.id, action: 'create', details: { body } });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
