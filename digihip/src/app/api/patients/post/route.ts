/**
 * API Route: Create a New Patient
 * @description Handles POST requests to create a new patient, ensuring all required fields are provided and unique fields are validated.
 * @path /digihip/src/app/api/patients/post
 * @file route.tsx 
 * @author @geoge31
 */

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";


/**
 * @description Handles the creation of a new patient.
 * @param request - The incoming POST request containing patient data.
 * @returns {NextResponse} - Success or error response.
 */
export async function POST(request: NextRequest) {

  logger.info(`Incoming request > POST ___ URL: ${request.url}`);

  let errorType = "";

  try {
    const token = request.headers.get('Authorization')?.split(" ")[1];

    if (!token) {
      logger.warn("Unauthorized access attempt: Missing token!");
      errorType = "missingToken";
      throw new Error("Unauthorized: Authentication token is missing.");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.doctorId) {
      errorType = "invalidToken";
      throw new Error("Unauthorized: Invalid authentication token.");
    }

    const requiredFields = [
      "admin",
      "amka",
      "firstname",
      "height",
      "isPreoperation",
      "lastname",
      "legOperation",
      "mobilephone",
      "primary",
      "supervisorDoctor",
      "weight",
    ];

    const uniqueFields = [
      "amedcode",
      "amka",
      "email",
      "mobilephone", 
    ]
    
    const patientData = await request.json();

    const missingFields = requiredFields.filter((field) => patientData[field] === undefined || patientData[field] === null || patientData[field] === "");

    if (missingFields.length > 0) {
      // setErrorType("missingField");
      errorType = "missingField";
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    await dbConnect();

    const duplicateChecks = await Promise.all(
      uniqueFields.map(async (field) => {
        if (!patientData[field] || patientData[field] === "") return null;
        const exists = await Patient.findOne({ [field]: patientData[field] });
        return exists ? field : null;
      })
    );

    const duplicateFields = duplicateChecks.filter((field) => field !== null);

    if (duplicateFields.length > 0) {
      // setErrorType("duplicatedField");
      errorType = "duplicatedField";
      throw new Error(
        `Duplicate values found for fields: ${duplicateFields.join(", ")}. Each must be unique.`
      );
    }

    const lastPatient = await Patient.findOne().sort({ id: -1 });
    let newId = lastPatient ? lastPatient.id + 1 : 1;

    console.log("Last Patient:", lastPatient);
    console.log("New ID:", newId);

    // Convert empty optional unique fields to undefined so the sparse unique index ignores them
    const optionalUniqueFields = ["amedcode", "email"];
    for (const field of optionalUniqueFields) {
      if (patientData[field] === "") {
        patientData[field] = undefined;
      }
    }

    let newPatient;
    let retries = 3;
    while (retries > 0) {
      try {
        const newPatientData = {
          ...patientData,
          id: newId,
        };

        newPatient = new Patient(newPatientData);
        await newPatient.save();
        break;
      } catch (err: unknown) {
        const mongoErr = err as { code?: number; keyPattern?: Record<string, unknown> };
        if (mongoErr.code === 11000 && mongoErr.keyPattern?.id) {
          retries--;
          if (retries === 0) throw err;
          newId++;
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Η εγγραφή ολοκληρώθηκε με επιτυχία", 
        patient: newPatient.toObject ? newPatient.toObject() : newPatient,
        medicalFilesVerification: `Files received: ${patientData.medicalFiles}`
      },
      { status: 201 }
    );
    
  } catch (error: unknown) {
    if(error instanceof Error){
    logger.error("Error during registration:", error);
    return NextResponse.json(
      { 
        success: false, 
        errorType,
        message: error.message || "Internal Server Error" 
      },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
    }
    logger.error("Unknown error during registration:", error);
    return NextResponse.json(
      {
        success: false,
        errorType,
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }

};
