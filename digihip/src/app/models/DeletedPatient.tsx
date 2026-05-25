/**
 * Stores patients that have been soft-deleted. Contains the full original
 * patient data along with deletion metadata (reason, who deleted, when).
 * @file DeletedPatient.tsx
 * @path src\app\models\DeletedPatient.tsx
 */

import mongoose, { Schema, Document } from "mongoose";

interface DeletedPatientDocument extends Document {
    patientData: Record<string, unknown>;
    deletionReason: string;
    deletedBy: string;
    deletedAt: Date;
}

const DeletedPatientSchema = new mongoose.Schema({
    patientData: { type: Schema.Types.Mixed, required: true },
    deletionReason: { type: String, required: true },
    deletedBy: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.DeletedPatient || mongoose.model<DeletedPatientDocument>("DeletedPatient", DeletedPatientSchema);
