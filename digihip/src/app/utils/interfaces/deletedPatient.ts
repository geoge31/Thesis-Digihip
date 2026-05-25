/**
 * @file deletedPatient.ts
 * @path src\app\utils\interfaces\deletedPatient.ts
 */

export interface DeletedPatientInterface {
    _id?: string;
    patientData: Record<string, unknown>;
    deletionReason: string;
    deletedBy: string;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
