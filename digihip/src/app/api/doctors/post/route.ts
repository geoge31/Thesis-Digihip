/**
 * '@/api/doctors/post/route.tsx' => Implementation
 * api-route for posting a new doctor
 */

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {

    await dbConnect();

    try {
        const { 
            username, 
            email, 
            password, 
            confirmPassword, 
            firstname, 
            lastname 
        } = await request.json();


        console.log(
            "Received data:", 
            { 
                username, 
                email, 
                password, 
                confirmPassword, 
                firstname, 
                lastname 
            }
        );

        if (
            !username || 
            !email || 
            !password || 
            !confirmPassword || 
            !firstName || 
            !lastName
            ) {
                return NextResponse.json(
                    { message: "Παρακαλούμε συμπληρώστε όλα τα πεδία." }, 
                    { status: 400 }
                );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Οι κωδικοί πρόσβασης δεν ταιριάζουν." }, 
                { status: 400 });
        }

       const existingDoctor = await Doctor.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingDoctor) {

            let message = "";

            if (existingDoctor.username === username) {
                message = "Υπάρχει ήδη χρήστης με αυτό το username.";
            } else if (existingDoctor.email === email) {
                message = "Υπάρχει ήδη χρήστης με αυτό το email.";
            }
            return  NextResponse.json(
                { message }, 
                { status: 400 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newDoctor = new Doctor({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        await newDoctor.save();

        return NextResponse.json(
            { message: "success registration !", doctor: newDoctor }, 
            { status: 201 }
        );

    } catch (error: unknown) {
        if(error instanceof Error){
        console.error("Error during signup:", error);

        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
    }
};
