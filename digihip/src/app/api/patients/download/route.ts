/**
 * API Route: Download Medical Files
 * @description Handles file downloads for patient medical records
 * @path /api/patients/download
 * @file route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const fileName = searchParams.get("fileName");

    if (!patientId || !fileName) {
      return NextResponse.json(
        { error: "Patient ID and file name are required" },
        { status: 400 }
      );
    }

    // Security: Prevent directory traversal
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid file name" },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), "public", "uploads", patientId, fileName);

    try {
      const fileBuffer = await readFile(filePath);
      const fileExtension = extname(fileName).toLowerCase();

      // Determine content type
      let contentType = "application/octet-stream";
      if (fileExtension === ".pdf") contentType = "application/pdf";
      if (fileExtension === ".png") contentType = "image/png";
      if (fileExtension === ".jpg" || fileExtension === ".jpeg") contentType = "image/jpeg";
      if (fileExtension === ".dcm") contentType = "application/dicom";

      logger.info(`File downloaded: ${fileName} for patient ${patientId}`);

      return new NextResponse(fileBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch (error) {
      logger.error(`File not found: ${filePath}`, error);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error downloading file:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
}
