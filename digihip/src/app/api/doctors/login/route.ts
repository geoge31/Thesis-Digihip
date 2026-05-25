/**
 *  '@/api/admins/login/route.tsx' => Implementation 
 * 
 *  api-context for logged-in doctor 
 */

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {

    await dbConnect();
  
    try {
        const { usernameOrEmail, password } = await request.json();
  
        const doctor = await Doctor.findOne({
            $or: [
                { username: usernameOrEmail }, 
                { email: usernameOrEmail }
            ]
        });

        
        if (!doctor) {
            return NextResponse.json(
                { user: usernameOrEmail },
                { status: 404 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, doctor.password);

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "Ο κωδικός πρόσβασης είναι λανθασμένος." },
                { status: 401 } 
            );
        }

        const token = jwt.sign(
            {doctorId: doctor.id }, 
            process.env.JWT_SECRET!,
            {expiresIn: '4h'}
        );

        return NextResponse.json(
            {
                token,
                message: "Successfull login",
                doctor : {
                    _id : doctor._id,
                    id: doctor.id,
                    username: doctor.username,
                    email: doctor.email,
                    firstname: doctor.firstname,
                    lastname: doctor.lastname
                }
            }, 
            { status: 200 }
            
        ); 
    } catch (error: unknown) {
        if(error instanceof Error){
        console.error("Error during login:", error);
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
    }
};