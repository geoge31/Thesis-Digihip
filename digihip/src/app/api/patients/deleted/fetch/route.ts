/**
 * Returns all soft-deleted patients from the DeletedPatients collection.
 * @file routes.ts
 * @path \src\app\api\patients\deleted\fetch\route.ts
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DeletedPatient from "@/models/DeletedPatient";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export async function GET(request: Request) {

    logger.info(`Incoming request > GET (deleted patients) ___ URL ${request.url}`);

    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
        );
    }

    await dbConnect();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.doctorId) {
            logger.info("Invalid Token");
            return NextResponse.json(
                { message: "Invalid Token" },
                { status: 401 },
            );
        }

        const deletedPatients = await DeletedPatient.find().sort({ deletedAt: -1 });

        return NextResponse.json(deletedPatients, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error fetching deleted patients: " + error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }
    }
}
