import {  NextResponse } from 'next/server';

// This is a placeholder route for Socket.IO initialization
// The actual Socket.IO server runs alongside Next.js
export async function GET() {
  return NextResponse.json({ message: 'Socket.IO server is running' });
}