// my_backend/models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    appointmentDate: { type: Date, required: true },
    appointmentDoctor: { type: String, required: true },
    appointmentReason: { type: String, required: true },
    appointmentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorName: { type: String, required: true },
    doctorSid: { type: String, required: true },
});

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
