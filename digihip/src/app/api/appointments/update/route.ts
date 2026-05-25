/**
 * @path > @/app/src/api/appointments/update
 * @geoge31 
 */

import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
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

    if(!token) {
        return NextResponse.json(
            { message: 'Unathorized!'},
            {status: 401}
        );
    }

    await dbConnect();

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if(!decodedToken || typeof decodedToken !== 'object' || !decodedToken.doctorId) {
            logger.info('Invalid Token');
            return NextResponse.json(
                { message: 'Invalid Token'},
                { status: 401 } 
            );
        }

        const { _id, updates } = await request.json();

        if(!_id || !updates || typeof updates !== 'object') {
            logger.info('Invalid request body');
            return NextResponse.json(
                { message: 'Invalid request body'},
                { status: 401 }
            );
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            _id,
            { $set: updates },
            { new: true }
        );

        if(!updatedAppointment) {
            return NextResponse.json(
                { messaage: 'Appointment not found'},
                { status: 404 }
            );
        }

        logger.info('Updated Appointment');
        return NextResponse.json(         
            { 
                updatedAppointment,
                message: 'Appointment successfully updated',
                status: 200,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        if(error instanceof Error){
        logger.info(`An error occured during appointment update : ${error}`);
        console.error('Error during appointment update', error);
        
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
    }
};