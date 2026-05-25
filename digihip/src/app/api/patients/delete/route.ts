/**
 * @path
 * @geoge31
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';
import jwt from 'jsonwebtoken';
import logger from '@/lib/logger';


export async function DELETE(request: Request) {

    logger.info(`Incoming request > DELETE ___ URL ${request.url}`);

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json(
            { message: 'Unathorized' },
            { status: 401 },
        );
    }

    await dbConnect();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if(!decodedToken || typeof decodedToken !== 'object' || !decodedToken.doctorId) {
            logger.info('Invalid Token');
            return NextResponse.json(
                { message: 'Invalid Token'},
                { status: 401 },
            );
        }

        const { id } = await  request.json();

        if (!id) {
            logger.info('Invalid Request Body');
            return NextResponse.json(
                { message: 'Invalid Request Body'},
                { status: 400 },
            );
        }

        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
            return NextResponse.json(
                { message: 'Patient not found'},
                { status: 404 },
            );
        }

        logger.info(`Patient deleted successfully ${id}`);
        return NextResponse.json(
            { message: 'Patient deleted successfully'},
            { status: 200 },
        );
    } catch(error: unknown) {
        if(error instanceof Error){
        logger.info('Error while deleting patient');
        console.error('Error while deleting patient');
        return NextResponse.json(
            { error: error.message },
            { status: 500 },
        );
    }
    }
};