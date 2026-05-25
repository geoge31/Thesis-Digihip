/**
 * @path @/src/app/utils/interfaces
 * @geoge31
 */

export interface DoctorData {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
}

export interface PatientData {
  _id?: string;
  id?: number;
  address: string;
  admin: DoctorData | null;
  alcohol: string;
  allergies: string;
  amedcode: string;
  amka: string;
  age: string;
  birthdate: string;
  bloodtype: string;
  chronicDiseases: string;
  comments: string;
  currentStage: string;
  email: string;
  entryDate: string;
  exitDate: string;
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
  smoking: string;
  supervisorDoctor: string;
  surgeries: string;
  treatments: string[];
  weight: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentInterface {
  _id?: string;
  appointmentDate: Date | null;
  appointmentDoctor: string | null;
  appointmentPatient: PatientData | null;
  appointmentReason: string | null;
  doctorName: string | null;
  doctorSid: string | null;
}
