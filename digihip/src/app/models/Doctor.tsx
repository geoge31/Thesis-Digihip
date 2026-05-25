/**
 * Doctor Model
 * 
 * @file Doctor.tsx
 * @path digihip/src/app/models/Doctor.tsx
 * @author Giorgos Geramoutsos
 * @description This file defines the Mongoose schema for the Doctor model.
 *              It includes fields for username, email, password, firstname, and lastname.
 *              The password field is required and unique, as are the username and email fields.
 *              The schema also includes a toJSON transformation to exclude the password field when converting the document to
 *              JSON format.
 * 
 * @module Doctor
 * @requires mongoose
 * @requires Schema 
 * @returns {mongoose.Model} - Returns the Mongoose model for the Doctor schema.
 * @throws {Error} - Throws an error if there is an issue with the schema definition
 */

import mongoose from "mongoose";

/**
 * Doctor Schema
 * This schema defines the structure of the Doctor document in the MongoDB database.
 * It includes fields for username, email, password, firstname, and lastname.
 * The username and email fields are required and must be unique.
 * The password field, firstname and lastname are also required.
 */
const DoctorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
});

DoctorSchema.set("toJSON", {
    transform: (doc, ret) =>{
        delete ret.password;
        return ret;
    }
});

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);