/**
 * Moves a patient from the Patients collection to DeletedPatients,
 * storing the deletion reason and the doctor who performed the deletion.
 * @file route.ts
 * @path src\app\api\patients\soft-delete\route.ts
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import DeletedPatient from "@/models/DeletedPatient";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export async function POST(request: Request) {

    logger.info(`Incoming request > POST (soft-delete) ___ URL ${request.url}`);

    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
        );
    }

    await dbConnect();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.doctorId) {
            logger.info("Invalid Token");
            return NextResponse.json(
                { message: "Invalid Token" },
                { status: 401 },
            );
        }

        const { id, reason, doctorName } = await request.json();

        if (!id) {
            logger.info("Invalid Request Body: missing patient id");
            return NextResponse.json(
                { message: "Invalid Request Body: missing patient id" },
                { status: 400 },
            );
        }

        if (!reason || reason.trim().length === 0) {
            logger.info("Invalid Request Body: missing deletion reason");
            return NextResponse.json(
                { message: "Invalid Request Body: missing deletion reason" },
                { status: 400 },
            );
        }

        if (!doctorName) {
            logger.info("Invalid Request Body: missing doctor name");
            return NextResponse.json(
                { message: "Invalid Request Body: missing doctor name" },
                { status: 400 },
            );
        }

        const patient = await Patient.findById(id);

        if (!patient) {
            return NextResponse.json(
                { message: "Patient not found" },
                { status: 404 },
            );
        }

        const deletedPatient = new DeletedPatient({
            patientData: patient.toObject(),
            deletionReason: reason.trim(),
            deletedBy: doctorName,
            deletedAt: new Date(),
        });

        await deletedPatient.save();

        await Patient.findOneAndDelete({ _id: id });

        logger.info(`Patient soft-deleted successfully ${id}`);
        return NextResponse.json(
            { message: "Patient deleted successfully" },
            { status: 200 },
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error while soft-deleting patient: " + error.message);
            console.error("Error while soft-deleting patient:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }
    }
}
