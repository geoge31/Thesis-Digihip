/**
 *  '@/api/admins/doctors/route.ts' => Implementation 
 * 
 *  api-route for admin panel doctor management (CRUD)
 */

import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generatePassword } from "@/utils/generatePassword";
import { sendEmail } from "@/utils/email/sendEmail";

const verifyAdminToken = (request: Request) => {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (
            !decoded || 
            typeof decoded !== "object" || 
            !decoded.isAdmin
        ) {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
};

export async function GET(request: Request) {

    await dbConnect();

    const decoded = verifyAdminToken(request);
    if (!decoded) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const doctors = await Doctor.find({});
        return NextResponse.json({ doctors });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching doctors:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
};

export async function POST(request: Request) {

    await dbConnect();

    const decoded = verifyAdminToken(request);
    if (!decoded) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { 
            username, 
            email, 
            firstname, 
            lastname 
        } = await request.json();

        if (
            !username || 
            !email || 
            !firstname || 
            !lastname
        ) {
            return NextResponse.json(
                { message: "Παρακαλούμε συμπληρώστε όλα τα πεδία." }, 
                { status: 400 }
            );
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
            return NextResponse.json(
                { message }, 
                { status: 400 }
            );
        }

        const plainPassword = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const newDoctor = new Doctor({
            username,
            email,
            password: hashedPassword,
            firstname,
            lastname
        });

        await newDoctor.save();

        try {
            await sendEmail({
                to: email,
                subject: "DigiHip - Στοιχεία Σύνδεσης",
                html: `
                    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <div style="background-color: #2196F3; padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DigiHip</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; font-size: 24px; margin-top: 0;">Καλώς ήρθατε στο DigiHip!</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">Ο λογαριασμός σας δημιουργήθηκε με επιτυχία.</p>
                            <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <p style="color: #333; font-size: 16px; margin: 8px 0;"><strong>Όνομα χρήστη:</strong> ${username}</p>
                                <p style="color: #333; font-size: 16px; margin: 8px 0;"><strong>Κωδικός πρόσβασης:</strong></p>
                                <p style="background-color: #f0f0f0; padding: 12px 18px; border-radius: 5px; font-family: monospace; font-size: 20px; letter-spacing: 2px; color: #2196F3; font-weight: bold; text-align: center;">${plainPassword}</p>
                            </div>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">Παρακαλούμε αλλάξτε τον κωδικό σας μετά την πρώτη σύνδεση.</p>
                        </div>
                        <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                            <p style="color: #999; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} DigiHip. Αυτό το email στάλθηκε αυτόματα.</p>
                        </div>
                    </div>
                `,
            });
        } catch (emailError) {
            await Doctor.findByIdAndDelete(newDoctor._id);
            console.error("Email failed, doctor rolled back:", emailError);
            return NextResponse.json(
                { message: "Αποτυχία αποστολής email. Ο γιατρός δεν δημιουργήθηκε." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Επιτυχής εγγραφή γιατρού! Ο κωδικός εστάλη στο email.", doctor: newDoctor }, 
            { status: 201 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error during doctor creation:", error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500 }
            );
        }
    }
};

export async function PATCH(request: Request) {

    await dbConnect();

    const decoded = verifyAdminToken(request);
    if (!decoded) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { id, updates, resetPassword } = await request.json();

        if (!id) {
            return NextResponse.json(
                { message: "Invalid request body" },
                { status: 400 }
            );
        }

        if (resetPassword) {
            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return NextResponse.json(
                    { message: "Doctor not found" },
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
                    subject: "DigiHip - Νέος Κωδικός Πρόσβασης",
                    html: `
                        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div style="background-color: #2196F3; padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DigiHip</h1>
                            </div>
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #333; font-size: 24px; margin-top: 0;">Επαναφορά Κωδικού Πρόσβασης</h2>
                                <p style="color: #555; font-size: 16px; line-height: 1.6;">Ο κωδικός πρόσβασής σας άλλαξε από τον διαχειριστή.</p>
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
                console.error("Email failed during password reset:", emailError);
                return NextResponse.json(
                    { message: "Αποτυχία αποστολής email. Ο κωδικός δεν άλλαξε." },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { message: "Ο νέος κωδικός εστάλη στο email του γιατρού!" },
                { status: 200 }
            );
        }

        if (!updates || typeof updates !== "object") {
            return NextResponse.json(
                { message: "Invalid request body" },
                { status: 400 }
            );
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedDoctor) {
            return NextResponse.json(
                { message: "Doctor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Επιτυχής ενημέρωση!", doctor: updatedDoctor },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error updating doctor:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
};

export async function DELETE(request: Request) {

    await dbConnect();

    const decoded = verifyAdminToken(request);
    if (!decoded) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { message: "Doctor ID is required" },
                { status: 400 }
            );
        }

        const deletedDoctor = await Doctor.findByIdAndDelete(id);

        if (!deletedDoctor) {
            return NextResponse.json(
                { message: "Doctor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Επιτυχής διαγραφή γιατρού!" },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error deleting doctor:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
};
