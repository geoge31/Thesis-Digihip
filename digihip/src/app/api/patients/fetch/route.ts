export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  logger.info("[GET /api/patients/fetch] Request received");

  const token = request.headers.get("Authorization")?.split(" ")[1];
  logger.info(`Token: ${token ? "Present" : "Missing"}`);

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    logger.info("Token decoded successfully");

    if (!decodedToken) {
      logger.warn("Invalid token payload");
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    logger.info("Connecting to DB...");
    await dbConnect();
    logger.info("DB connected");

    logger.info("Fetching patients from DB...");
    const patients = await Patient.find()
      // .select(
      //   "_id id firstname lastname email amka currentStage supervisorDoctor createdAt mobilephone"
      // )
      .sort({ createdAt: -1 })
      .populate("admin", "firstname lastname")
      .lean();

    logger.info(`Fetched ${patients.length} patients`);

    return NextResponse.json(patients);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error in /api/patients/fetch", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.error("Unknown error occurred");
    return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
  }
}
