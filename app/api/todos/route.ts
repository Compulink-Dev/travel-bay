import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/database';
import Todo from '@/models/Todo';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const todos = await Todo.find({}).sort({ createdAt: -1 });
    return NextResponse.json(todos);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const todo = await Todo.create({ ...body, userId: user.id });
    return NextResponse.json(todo, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}