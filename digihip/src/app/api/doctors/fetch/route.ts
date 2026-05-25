/** 
 *  @/app/api/doctors/fetch/route.tsx => Implementation  
 *  api route for fetching all doctors 
 */
export const dynamic = "force-dynamic"; 
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";

export async function GET(request: Request){

    await dbConnect();

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if(!token) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if(!decodedToken) {
            return NextResponse.json(
                { message: 'Invalid Token' },
                { status: 401 }
            );
        }

        const doctors = await Doctor.find({});

        return NextResponse.json(doctors);

    }catch(error: unknown) {
        if(error instanceof Error){
        console.error("Error fetching admins:", error); 
        return NextResponse.json(
            {error: error.message}
        );
    }
    }
};
