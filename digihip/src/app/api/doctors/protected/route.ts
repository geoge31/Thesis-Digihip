/**
 * '@/api/doctors/protected/route.tsx' => Implementation
 * api-route for protected doctor using token-authorization
 */

import jwt, { JwtPayload } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  logger.info(`Incoming request - URL: ${request.url}`);

  const token = request.headers.get("Authorization")?.split(" ")[1]; // Extract the token from Authorization header

  if (!token) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  await dbConnect();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decodedToken === "object" && "doctorId" in decodedToken) {
      const doctorId = (decodedToken as JwtPayload).doctorId;

      // Fetch the doctor based on decoded ID
      const doctor = await Doctor.findById(doctorId);

      // console.log(admin);

      if (!doctor) {
        return NextResponse.json(
          { message: "Doctor not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(doctor); // Return the admin data
    } else {
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  }
}
