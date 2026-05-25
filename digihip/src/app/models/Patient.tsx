/**
 * Patient Model
 *
 * @file Patient.ts
 * @path digihip/src/app/models/Patient.ts
 * @author Giorgos Geramoutsos, Manos Spanakis
 * @description This file defines the Patient model schema using Mongoose.
 *              It includes fields for personal information, medical history, and relationships with doctors.
 *              It also includes pre-hooks to handle the deletion of associated appointments and messages when a patient is deleted.
 *
 * @module Patient
 * @requires mongoose
 * @requires Schema
 * @requires Document
 * @requires CallbackError
 * @requires Appointment
 * @requires Message   
 * 
 */

import mongoose, { Schema, Document, CallbackError } from "mongoose";
import Appointment from '@/models/Appointment';
import Message from '@/models/Message';

interface PatientDocument extends Document {
    _id: mongoose.Types.ObjectId;
    address: string;
    admin: mongoose.Types.ObjectId;
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
    entryDate: Date;
    exitDate: Date;
    firstname: string;
    height: string;
    isPreoperation: boolean;
    lastname: string;
    legOperation: string;
    manualStage: boolean;
    medicines: string[];
    medicalFiles: string;
    mobilephone: string;
    operationDate: Date;
    pastOperations: string;
    preExercises: string[];
    preInstructions: string[];
    primary: boolean;
    smoking: boolean;
    surgeries: string;
    supervisorDoctor: string;
    treatments: string[]
    weight: string;
}

/**
 * Patient Schema
 * This schema defines the structure of the Patient document in the MongoDB database.
 * It includes fields for personal information, medical history, and relationships with doctors.    
 * @typedef {Object} PatientSchema
 * @property {Number} id - Unique identifier for the patient.
 * @property {String} address - Address of the patient.
 * @property {Schema.Types.ObjectId} admin - Reference to the doctor who administers the patient.
 * @property {Boolean} alcohol - Indicates if the patient consumes alcohol.
 * @property {String} allergies - Allergies of the patient.
 * @property {String} amedcode - Unique medical code for the patient.           
 * @property {String} amka - Unique identification number for the patient.
 * @property {Date} birthdate - Birthdate of the patient.
 * @property {String} bloodtype - Blood type of the patient.
 * @property {String} chronicDiseases - Chronic diseases the patient has.
 * @property {String} comments - Additional comments about the patient.
 * @property {String} currentStage - Current stage of the patient's treatment.
 * @property {String} email - Email address of the patient.
 * @property {Date} entryDate - Date when the patient was admitted.
 * @property {Date} exitDate - Date when the patient was discharged.
 * @property {String} firstname - First name of the patient.
 * @property {String} height - Height of the patient.
 * @property {Boolean} isPreoperation - Indicates if the patient is in the pre-operation stage.
 * @property {String} lastname - Last name of the patient.
 * @property {String} legOperation - Type of leg operation the patient has undergone.
 * @property {String[]} medicines - List of medicines the patient is taking.
 * @property {String} mobilephone - Mobile phone number of the patient. 
 * @property {Date} operationDate - Date of the patient's operation.  
 * @property {String} pastOperations - Details of past operations the patient has undergone.
 * @property {String[]} preExercises - List of pre-operation exercises for the patient.
 * @property {String[]} preInstructions - Pre-operation instructions for the patient.
 * @property {Boolean} primary - Indicates if this is the primary patient record.   
 * @property {Boolean} smoking - Indicates if the patient smokes.
 * @property {String} surgeries - Details of surgeries the patient has undergone.
 * @property {String} supervisorDoctor - Name of the doctor supervising the patient.
 * @property {String[]} treatment - List of treatments the patient is undergoing.
 * @property {Schema.Types.ObjectId} updatedBy - Reference to the doctor who last updated the patient record.
 * @property {String} weight - Weight of the patient.
 * @property {String} fcmToken - Firebase Cloud Messaging token for the patient.
 *         
 */
const PatientSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    address: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    alcohol: { type: Boolean },
    allergies: { type: String },
    amedcode: { type: String, unique: true, sparse: true },
    amka: { type: String, required: true, unique: true },
    birthdate: { type: Date},
    bloodtype: { type: String},
    chronicDiseases: { type: String },
    comments: { type: String},
    currentStage: { type: String },
    email: { type: String, unique: true, sparse: true },
    entryDate: { type: Date },
    exitDate: { type: Date },
    firstname: { type: String, required: true },
    height: { type: String, required: true },
    isPreoperation: { type: Boolean, required: true },
    lastname: { type: String, required: true },
    legOperation: { type: String, required: true },
    manualStage: { type: Boolean, default: false },
    medicines: { type: [String] },
    medicalFiles: { type: String },
    mobilephone: { type: String, required: true, unique: true },
    operationDate: { type: Date },
    pastOperations: { type: String },
    preExercises: { type: [String] },
    preInstructions: { type: [String] },
    primary: {type: Boolean, required: true },
    smoking: { type: Boolean },
    surgeries: { type: String },
    supervisorDoctor: { type: String, required: true },
    treatments: { type: [String] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
    weight: { type: String, required: true },
    fcmToken: { type: String },
    changeLog: [{
        doctorName: { type: String, required: true },
        field: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });



/**
 * Pre-hook for findOneAndDelete operation on Patient schema
 * This hook is triggered before a patient document is deleted.
 * It deletes all appointments and messages associated with the patient being deleted.
 * @param {Function} next - The callback function to signal completion of the pre-hook.
 * @returns {Promise<void>} - Returns a promise that resolves when the pre-hook is complete.
 * @throws {CallbackError} - Throws an error if there is an issue during the deletion of appointments or messages.
 * 
 */
PatientSchema.pre("findOneAndDelete", { document: false, query: true }, async function (next) {
    const patientId = this.getQuery()._id; // Get the ID of the patient being deleted
    if (patientId) {
        try {
            // Delete appointments associated with the patient
            await Appointment.deleteMany({ appointmentPatient: patientId });
            
            // Delete messages associated with the patient
            await Message.deleteMany({ patient_id: patientId });

            next();
        } catch (error) {
            next(error as CallbackError);
        }
    }
});

export default mongoose.models.Patient ||  mongoose.model<PatientDocument>("Patient", PatientSchema);