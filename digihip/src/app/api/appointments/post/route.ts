/**
 * @geoge31
 */

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import jwt from 'jsonwebtoken';
import logger from "@/lib/logger";

/**
 * 
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {

    logger.info(`Incoming request > POST ___ URL: ${request.url}`);
  
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

        if(!decodedToken || typeof decodedToken !== 'object' || !decodedToken.doctorId) {
            logger.info('Invalid Token');
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 },
            );
        }

        const { id, newAppointmentData } = await request.json();

        if(!id || !newAppointmentData) {
            logger.info('Invalid request body');
            return NextResponse.json(
                { message: 'Invalid request body' },
                { status: 401 },
            );
        }

        const newAppointment = new Appointment(newAppointmentData);

        await newAppointment.save();

        if(!newAppointment) {
            return NextResponse.json(
                { message: 'Posting new appointment failed' },
                { status: 401 },
            );
        }

        logger.info('Posted New Appointment');
        return NextResponse.json(
            {
                newAppointment,
                message: 'Successfully posted a new appointment',
                status: 200,
            },
            { status: 200 }
        );
    
    } catch (error:unknown) {
        if(error instanceof Error){
        logger.info(`An error occured during appointment post :  ${error}`);
        console.error(`Error during appointment post : ${error}`);   
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    }
};