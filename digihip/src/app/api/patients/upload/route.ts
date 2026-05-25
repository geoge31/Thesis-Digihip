/**
 * API Route: Upload Medical Files
 * @description Handles file uploads for patient medical records
 * @path /api/patients/upload
 * @file route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const patientId = formData.get("patientId") as string;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads", patientId);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      logger.error("Error creating upload directory:", error);
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, file.name);

      await writeFile(filePath, buffer);
      uploadedFiles.push(file.name);
      logger.info(`File uploaded: ${file.name} for patient ${patientId}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Files uploaded successfully",
        files: uploadedFiles,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error uploading files:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
}
