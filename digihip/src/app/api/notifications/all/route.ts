// /api/notifications/all.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const data = await Notification.find({});
    return NextResponse.json(data || {});
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}