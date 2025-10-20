import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Customer from '@/models/Customer';

export async function GET() {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await Customer.find({}).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.email || !body.phone) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const item = await Customer.create({ ...body });
  return NextResponse.json(item, { status: 201 });
}