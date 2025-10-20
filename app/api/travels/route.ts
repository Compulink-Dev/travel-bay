import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Travel from '@/models/Travel';

export async function GET() {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await Travel.find({}).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.contact || !body.address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const item = await Travel.create({ ...body, userId: user.id });
  return NextResponse.json(item, { status: 201 });
}