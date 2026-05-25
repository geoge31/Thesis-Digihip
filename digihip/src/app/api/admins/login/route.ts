/**
 *  '@/api/admins/login/route.ts' => Implementation 
 * 
 *  api-route for admin login
 */

import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {

    await dbConnect();

    try {
        const { usernameOrEmail, password } = await request.json();

        const admin = await Admin.findOne({
            $or: [
                { username: usernameOrEmail }, 
                { email: usernameOrEmail }
            ]
        });

        if (!admin) {
            return NextResponse.json(
                { user: usernameOrEmail },
                { status: 404 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "Ο κωδικός πρόσβασης είναι λανθασμένος." },
                { status: 401 } 
            );
        }

        const token = jwt.sign(
            { adminId: admin.id, isAdmin: true }, 
            process.env.JWT_SECRET!,
            { expiresIn: '4h' }
        );

        return NextResponse.json(
            {
                token,
                message: "Successfull admin login",
                admin: {
                    _id: admin._id,
                    id: admin.id,
                    username: admin.username,
                    firstname: admin.firstname,
                    lastname: admin.lastname
                }
            }, 
            { status: 200 }
        ); 
    } catch (error: unknown) {
        if(error instanceof Error){
            console.error("Error during admin login:", error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500 }
            );
        }
    }
};
