/**
 *  '@/api/doctors/change-password/route.ts'
 *  API route for authenticated doctor to change their own password.
 *  Requires: current password verification + new password.
 */

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {

    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    await dbConnect();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if (
            !decodedToken ||
            typeof decodedToken !== "object" ||
            !decodedToken.doctorId
        ) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "Παρακαλούμε συμπληρώστε όλα τα πεδία." },
                { status: 400 }
            );
        }

        const doctor = await Doctor.findById(decodedToken.doctorId);

        if (!doctor) {
            return NextResponse.json(
                { message: "Ο γιατρός δεν βρέθηκε." },
                { status: 404 }
            );
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, doctor.password);

        if (!isCurrentPasswordCorrect) {
            return NextResponse.json(
                { message: "Ο τρέχων κωδικός πρόσβασης είναι λανθασμένος." },
                { status: 401 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        doctor.password = hashedPassword;
        await doctor.save();

        return NextResponse.json(
            { message: "Ο κωδικός πρόσβασης άλλαξε με επιτυχία!" },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error changing password:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
}
