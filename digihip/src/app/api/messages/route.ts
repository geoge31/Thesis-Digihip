// Backend
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Server } from "socket.io";
import admin from '../../lib/firebaseAdmin';
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";


declare global {
  interface GlobalThis {
    io?: Server;
  }
}

if (!("io" in globalThis)) {
  Object.defineProperty(globalThis, "io", {
    value: undefined,
    writable: true,
  });
}

interface MessageDetail {
  _id: mongoose.Schema.Types.ObjectId;
  sender_id: mongoose.Schema.Types.ObjectId;
  text: string;
  messageType: 'text' | 'image' | 'pdf';
  mediaUrl: string,
  fileName: string,
  timestamp: Date;
  sender_name?: string; // Add sender_name for dynamic use
}

interface Messages {
  _id: mongoose.Schema.Types.ObjectId;
  patient_id: mongoose.Schema.Types.ObjectId;
  patientid: number;
  patient_name?: string; // Add patient_name for dynamic use
  messages: MessageDetail[];
}

export async function GET() {
  await dbConnect();

  try {
    // Fetch all messages and cast them to the correct type using `as`
    const messages = (await Message.find({}).lean()) as Messages[];

    // Collect all patient and admin IDs that are used in the messages
    const patientIds = Array.from(
      new Set(messages.map((m) => m.patient_id.toString()))
    ); // Unique patient IDs
    const senderIds = Array.from(
      new Set(
        messages.flatMap((m: Messages) =>
          m.messages.map((msg: MessageDetail) => msg.sender_id.toString())
        )
      )
    ); // Unique sender IDs

    // Fetch all relevant patients and admins in one go
    const patients = await Patient.find({ _id: { $in: patientIds } });
    const doctors = await Doctor.find({ _id: { $in: senderIds } });

    // Create lookup maps for patients and admins to avoid repeated database queries
    const patientMap = Object.fromEntries(
      patients.map((patient) => [patient._id.toString(), patient])
    );
    const doctorMap = Object.fromEntries(
      doctors.map((doctor) => [doctor._id.toString(), doctor])
    );

    // Map patient and sender names to messages
    messages.forEach((message: Messages) => {
      // Add patient name
      const patient = patientMap[message.patient_id.toString()];
      if (patient) {
        message.patient_name = `${patient.firstname} ${patient.lastname}`;
        message.patientid = patient.id; // smaller patientID
      }

      // Map sender names to each message in the conversation
      message.messages.forEach((msg: MessageDetail) => {
        const sender =
          patientMap[msg.sender_id.toString()] ||
          doctorMap[msg.sender_id.toString()];
        if (sender) {
          msg.sender_name = `${sender.firstname} ${sender.lastname}`;
        }
      });
    });
    return NextResponse.json(messages);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const patient_id = formData.get("patient_id") as string;
    const sender_id = formData.get("sender_id") as string;
    const text = formData.get("text") as string;
    const file = formData.get("file") as File | null;

    if (!patient_id || !sender_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(patient_id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    // File upload logic
    let mediaUrl = null;
    let messageType: "text" | "image" | "pdf" = "text";
    let fileName: string | undefined = undefined;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext);

      // ✅ Sanitize filename (remove spaces and special characters)
      const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/\s+/g, "_");
      const uniqueName = `${safeBaseName}_${Date.now()}${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads");

      try {
        await stat(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      const baseUrl = "http://139.91.210.34";
      // ✅ Full media URL
      mediaUrl = `${baseUrl}/uploads/${encodeURIComponent(uniqueName)}`;
      messageType = file.type.startsWith("image") ? "image" : "pdf";
      fileName = uniqueName;
    }

    let messageDocument = await Message.findOne({ patient_id });
    if (!messageDocument) {
      messageDocument = new Message({
        _id: new mongoose.Types.ObjectId(),
        patient_id: patient_id,
        messages: [],
      });
    }

    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender_id,
      text,
      timestamp: new Date(),
      isRead: false,
      mediaUrl,
      messageType,
      fileName,
    };
    messageDocument.messages.push(newMessage);
    await messageDocument.save();

    // 🔥 Get patient FCM token
    const patient = await Patient.findById(patient_id);
    if (patient?.fcmToken) {
      try {
        const response = await admin.messaging().send({
          token: patient.fcmToken,
          notification: {
            title: 'Νέο μήνυμα από γιατρό',
            body: text || (messageType === "image" ? "Λάβατε μία φωτογραφία" : "Λάβατε ένα αρχείο"),
          },
          android: {
            priority: 'high',
            notification: {
              visibility: 'PUBLIC',
              sound: 'default',
              channelId: 'default',
              icon: "ic_notification",
            },
          },
          data: {
            type: 'new_message',
            patient_id: patient_id,
          },
        });
    
        console.log('✅ Notification sent successfully:', response);
      } catch (err) {
        console.error('❌ Failed to send notification:', err);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ioInstance = (globalThis as any).io;

    if (ioInstance) {
      ioInstance.emit("newMessage", {
        patient_id: patient_id,
        messages: messageDocument.messages,
      });
    } else {
      console.warn("WebSocket server not initialized.");
    }

    return NextResponse.json(
      { success: true, message: messageDocument },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error saving message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
