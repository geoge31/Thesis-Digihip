/**
 * 
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
// import Patient from "@/models/Patient";
import "@/models/Patient";
import jwt from "jsonwebtoken"
import logger from "@/lib/logger";

export async function GET(request: Request) {
    logger.info(`Incoming request > GET ___ URL: ${request.url}`);
  
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if(!token) {
        return NextResponse.json(
            {message: 'Unauthorized'},
            {status: 401}
        );
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if(!decodedToken) {
            return NextResponse.json(
                {mesage: 'Invalid Token'},
                {status: 401}
            );
        }

        await dbConnect();

        const appointments = await Appointment.find({}).populate("patient");
        
        logger.info("Fetched Appointments ")

        return NextResponse.json(appointments);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error in authorization:", error);
            logger.info(`Error in authorization: ${error.message}`);

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
}