/**
 * @path @/src/app/api/doctors/update
 * @geoge31
 *  
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export async function PATCH(request:Request) {
    
    logger.info(`Incoming request > PATCH ___ URL: ${request.url}`);

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if(!token) {
        return NextResponse.json(
            { message: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    await dbConnect();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.doctorId) {
            return NextResponse.json(
                { message: 'Invalid token' }, 
                { status: 401 }
            );
        }

        const {  pId, updates, changedFields } = await request.json();

        if(!pId || !updates || typeof updates !== 'object') {
            return NextResponse.json(
                { message: 'Invalid request body' }, 
                { status: 400 }
            );
        }

        const { changeLog, ...fieldsToSet } = updates;
        const updateOps: Record<string, unknown> = { $set: fieldsToSet };

        if(changedFields && Array.isArray(changedFields) && changedFields.length > 0) {
            const doctor = await Doctor.findById(decodedToken.doctorId);
            const doctorName = doctor
                ? `${doctor.firstname} ${doctor.lastname}`
                : 'Άγνωστος';

            const logEntries = changedFields.map((field: string) => ({
                doctorName,
                field,
                changedAt: new Date(),
            }));

            updateOps.$push = { changeLog: { $each: logEntries } };
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            pId,
            updateOps,
            { new: true },
        );

        if(!updatedPatient) {
            return NextResponse.json(
                { message: 'Patient not found' }, 
                { status: 404 }
            );
        }

        return NextResponse.json(
            updatedPatient, 
            { status: 200 }
        );

    } catch (error: unknown) {
        if(error instanceof Error){
        console.error('Error updating patient', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 },
        );
    }
    }
};

