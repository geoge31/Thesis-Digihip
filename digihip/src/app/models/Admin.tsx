/**
 * Admin Model
 * @file Admin.tsx
 * @path digihip/src/app/models/Admin.tsx
 * @description This file defines the Mongoose schema for the Admin model.
 *              It includes fields for username, email, password, firstname, and lastname.
 *              The password field is required and unique, as are the username and email fields.
 *              The schema also includes a toJSON transformation to exclude the password field when converting the document to
 *              JSON format.
 * @module Admin
 * @requires mongoose
 * @requires Schema 
 * @returns {mongoose.Model} - Returns the Mongoose model for the Admin schema.
 * @throws {Error} - Throws an error if there is an issue with the schema definition
 */

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
});

AdminSchema.set("toJSON", {
    transform: (doc, ret) =>{
        delete ret.password;
        return ret;
    }
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
