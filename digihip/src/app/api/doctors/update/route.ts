/**
 * @path @/src/app/api/doctors/update
 * @geoge31
 *
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

/**
 *
 * @param request
 * @returns
 */
export async function PATCH(request: Request) {
  logger.info(`Incoming request > PATCH ___ URL: ${request.url}`);

  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      !decodedToken ||
      typeof decodedToken !== "object" ||
      !decodedToken.doctorId
    ) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id, updates } = await request.json();

    if (!id || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedDoctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDoctor, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating doctor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
