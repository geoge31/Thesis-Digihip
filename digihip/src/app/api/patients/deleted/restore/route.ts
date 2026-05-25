/**
 * Restores a patient from the DeletedPatients collection back to the Patients collection.
 * @file route.ts
 * @path src\app\api\patients\deleted\restore\route.ts
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import DeletedPatient from "@/models/DeletedPatient";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export async function POST(request: Request) {

    logger.info(`Incoming request > POST (restore patient) ___ URL ${request.url}`);

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

        const { deletedPatientId } = await request.json();

        if (!deletedPatientId) {
            return NextResponse.json(
                { message: "Invalid Request Body: missing deletedPatientId" },
                { status: 400 },
            );
        }

        const deletedRecord = await DeletedPatient.findById(deletedPatientId);

        if (!deletedRecord) {
            return NextResponse.json(
                { message: "Deleted patient record not found" },
                { status: 404 },
            );
        }

        const patientData = JSON.parse(JSON.stringify(deletedRecord.patientData));

        delete patientData._id;
        delete patientData.__v;
        delete patientData.createdAt;
        delete patientData.updatedAt;

        if (patientData.primary === undefined || patientData.primary === null) {
            patientData.primary = false;
        }
        if (patientData.isPreoperation === undefined || patientData.isPreoperation === null) {
            patientData.isPreoperation = false;
        }

        const uniqueChecks = ["amka", "email", "mobilephone", "amedcode"];
        for (const field of uniqueChecks) {
            if (patientData[field]) {
                const existing = await Patient.findOne({ [field]: patientData[field] });
                if (existing) {
                    return NextResponse.json(
                        { message: `Conflict: a patient with ${field} "${patientData[field]}" already exists.` },
                        { status: 409 },
                    );
                }
            }
        }

        const lastPatient = await Patient.findOne().sort({ id: -1 });
        const newId = lastPatient ? lastPatient.id + 1 : 1;
        patientData.id = newId;

        const restoredPatient = new Patient(patientData);
        await restoredPatient.save();

        await DeletedPatient.findByIdAndDelete(deletedPatientId);

        logger.info(`Patient restored successfully. New id: ${newId}`);
        return NextResponse.json(
            { message: "Patient restored successfully", patient: restoredPatient },
            { status: 200 },
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error restoring patient: " + error.message);
            console.error("Error restoring patient:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }
    }
}
