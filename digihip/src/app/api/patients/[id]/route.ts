import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import jwt from "jsonwebtoken";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    console.log("[GET /api/patients/[id]] Request received");
    console.log(`Token: ${token ? "Present" : "Missing"}`);
    console.log("GET patient API called, id:", params.id);

    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      console.log("Token invalid after verification");
      return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    const patient = await Patient.findById(params.id).populate('admin');

    if (!patient) {
      console.log("Patient not found");
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    console.log('patient keys:', Object.keys(patient.toObject()));
    console.log('patient full:', JSON.stringify(patient, null, 2));

    return NextResponse.json(patient);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in GET patient API:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}