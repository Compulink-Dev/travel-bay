import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Notification from '@/models/Notifications';

export async function GET() {
  await connectDB();
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await Notification.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json(notifications);
}

export async function PUT(request: NextRequest) {
  await connectDB();
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { notificationIds, markAll } = body;

  if (markAll) {
    await Notification.updateMany(
      { userId: user.id, isRead: false },
      { $set: { isRead: true } }
    );
  } else if (notificationIds && notificationIds.length > 0) {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId: user.id },
      { $set: { isRead: true } }
    );
  }

  return NextResponse.json({ success: true });
}