/**
 * @path 
 * @file: 
 * @author:
 */

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import DoctorModel from "@/models/Doctor"; 

/**
 * 
 * @returns 
 */
export async function GET() {
  try {
    await dbConnect();

    const doctors = await DoctorModel.find({}, { username: 1, email: 1});

    // Return full list as array of objects
    const result = doctors.map(doc => ({
      username: doc.username,
      email: doc.email,
    }));

    return NextResponse.json({ doctors: result }, { status: 200 });

  } catch (error) {
    console.error("Error fetching doctor usernames:", error);
    return NextResponse.json(
      { message: "Failed to fetch doctor usernames", error: error.message },
      { status: 500 }
    );
  }
}
