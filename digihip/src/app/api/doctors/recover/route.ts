/**
 *  '@/api/doctors/recover/route.ts' => Implementation
 *
 *  API route for doctor password recovery - generates a new random
 *  password, saves it, and emails it to the doctor.
 */

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/utils/generatePassword";
import { sendEmail } from "@/utils/email/sendEmail";

export async function POST(request: Request) {

    await dbConnect();

    try {
        const { usernameOrEmail } = await request.json();

        if (!usernameOrEmail) {
            return NextResponse.json(
                { message: "Παρακαλούμε εισάγετε το username ή το email σας." },
                { status: 400 }
            );
        }

        const doctor = await Doctor.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!doctor) {
            return NextResponse.json(
                { message: "Δεν βρέθηκε λογαριασμός με αυτά τα στοιχεία." },
                { status: 404 }
            );
        }

        const plainPassword = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const oldPassword = doctor.password;
        doctor.password = hashedPassword;
        await doctor.save();

        try {
            await sendEmail({
                to: doctor.email,
                subject: "DigiHip - Ανάκτηση Κωδικού Πρόσβασης",
                html: `
                    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <div style="background-color: #2196F3; padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DigiHip</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; font-size: 24px; margin-top: 0;">Ανάκτηση Κωδικού Πρόσβασης</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">Λάβαμε αίτημα ανάκτησης κωδικού για τον λογαριασμό σας.</p>
                            <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <p style="color: #333; font-size: 16px; margin: 8px 0;"><strong>Όνομα χρήστη:</strong> ${doctor.username}</p>
                                <p style="color: #333; font-size: 16px; margin: 8px 0;"><strong>Νέος κωδικός πρόσβασης:</strong></p>
                                <p style="background-color: #f0f0f0; padding: 12px 18px; border-radius: 5px; font-family: monospace; font-size: 20px; letter-spacing: 2px; color: #2196F3; font-weight: bold; text-align: center;">${plainPassword}</p>
                            </div>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">Παρακαλούμε αλλάξτε τον κωδικό σας μετά την επόμενη σύνδεση.</p>
                        </div>
                        <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                            <p style="color: #999; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} DigiHip. Αυτό το email στάλθηκε αυτόματα.</p>
                        </div>
                    </div>
                `,
            });
        } catch (emailError) {
            doctor.password = oldPassword;
            await doctor.save();
            console.error("Email failed during recovery:", emailError);
            return NextResponse.json(
                { message: "Αποτυχία αποστολής email. Ο κωδικός δεν άλλαξε." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Ο νέος κωδικός εστάλη στο email σας." },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error during recovery:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
}
