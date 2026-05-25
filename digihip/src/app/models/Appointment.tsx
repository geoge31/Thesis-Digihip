/**
 *  Appointment Model
 * @file Appointment.tsx
 * @path digihip/src/app/models/Appointment.tsx
 * @author Giorgos Geramoutsos
 * @description This file defines the Appointment model for the DigiHip application.
 *              It includes fields for datetime, doctor, patient, reason, createdAt, updatedAt,
 *              and updatedBy. The patient field references the Patient model.
 *              The createdAt and updatedAt fields are automatically set to the current date.
 *              The updatedBy field is required and stores the username of the user who last updated the
 *              appointment.
 * @module Appointment
 * @requires mongoose
 * @requires Schema
 * @exports Appointment
 */


import mongoose, {Schema} from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    datetime: {type: Date, required: true},
    doctor: {type: String, required: true},
    patient: {type: Schema.Types.ObjectId, ref: "Patient", required: true},
    reason: {type: String, required: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    updatedBy: {type: String, required: true},
});

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);