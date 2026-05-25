import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request: Request) {
  
  await dbConnect();

  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Explicitly type the response from Admin.findOne()
    const doctor = (await Doctor.findOne({ username }).lean()) as {
      _id: mongoose.Types.ObjectId;
    };

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json({ doctorId: doctor._id.toString() });
  } catch (error: unknown) {
    if(error instanceof Error){
    console.error("Error fetching admin ID:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
