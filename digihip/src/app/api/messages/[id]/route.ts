// src/app/api/messages/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; // Make sure this path is correct for your project
import Message from "@/models/Message";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { id } = params;
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Conversation deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
