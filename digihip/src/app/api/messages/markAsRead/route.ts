import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to the database

    const { conversationId, doctorId } = await request.json(); // Extract conversation ID from the request

    // Update all messages within the specified conversation to set isRead to true
    const result = await Message.updateOne(
      { _id: conversationId },
      { $set: { "messages.$[msg].isRead": true } }, // Updates all messages in the array
      {
        arrayFilters: [{ "msg.sender_id": { $ne: doctorId } }], // Updates only where sender_id !== doctorId
        new: true,
      }
    );

    // If the conversation ID was not found or updated, return a 404
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
  }
}
