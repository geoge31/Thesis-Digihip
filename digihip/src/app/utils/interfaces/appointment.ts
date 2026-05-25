/**
 * 
 */

import { PatientOfAppointment } from "@/utils/interfaces/patient";

export interface AppointmentInterface {
    _id?: string ;
    datetime?: Date;
    doctor?: string;
    patient?: PatientOfAppointment;
    reason?: string;
    createdAt?: Date;
    updatedAt?: Date;
    updatedBy?: string;
}