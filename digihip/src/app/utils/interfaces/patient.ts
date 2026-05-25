/**
 * 
 */

import { DoctorInterface } from "@/utils/interfaces/doctor";

export interface ChangeLogEntry {
    doctorName: string;
    field: string;
    changedAt: Date;
}

export interface PatientInterface {
    _id?: string;
    id?: number;
    address: string;
    admin: DoctorInterface | null;
    alcohol: string;
    allergies: string;
    amedcode: string;
    amka: string;
    birthdate: string;
    bloodtype: string;
    chronicDiseases: string;
    comments: string;
    currentStage: string;
    email: string;
    entryDate: string;
    exitDate: string;
    medicalFiles?: string;
    firstname: string;
    height: string;
    isPreoperation: boolean;
    legOperation: string;
    lastname: string;
    manualStage: boolean;
    medicines: string[];
    mobilephone: string;
    operationDate: string;
    pastOperations: string;
    preExercises: string[];
    preInstructions: string[];
    primary: string;
    smoking: string;
    surgeries: string;
    supervisorDoctor: string;
    treatments: string[];
    weight: string;
    createdAt?: Date;
    updatedAt?: Date;
    changeLog?: ChangeLogEntry[];
};

export interface NewPatient {
    _id?: string;
    id?: number;
    address: string;
    admin: string;
    alcohol: boolean;
    allergies: string;
    amedcode: string;
    amka: string;
    birthdate: Date;
    bloodtype: string;
    chronicDiseases: string;
    comments: string;
    currentStage: string;
    email: string;
    entryDate: Date | null;
    exitDate: Date | null;
    medicalFiles?: string;
    firstname: string;
    height: string;
    isPreoperation: boolean;
    legOperation: string;
    lastname: string;
    manualStage: boolean;
    medicines: string[];
    mobilephone: string;
    operationDate: Date | null;
    pastOperations: string;
    preExercises: string[];
    preInstructions: string[];
    primary: boolean;
    smoking: boolean;
    surgeries: string;
    supervisorDoctor: string;
    treatments: string[];
    weight: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface PatientOfAppointment {
    _id?: string;
    id?: number;
    firstname: string;
    lastname: string;
}