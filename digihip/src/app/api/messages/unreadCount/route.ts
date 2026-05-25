import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Aggregate query to count all unread messages (isRead: false)
    const unreadCount = await Message.aggregate([
      { $unwind: "$messages" },
      { $match: { 
          "messages.isRead": false, // Only unread messages
          $expr: { $eq: ["$patient_id", "$messages.sender_id"] } // Check if patient_id matches sender_id
        } 
      },
      { $count: "unreadCount" }
    ]);

    // If there are no unread messages, set the count to 0
    const count = unreadCount[0]?.unreadCount || 0;

    // Return the unread count
    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread messages count' }, { status: 500 });
  }
}
