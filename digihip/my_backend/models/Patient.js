// my_backend/models/Patient.js
import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    birthdate: Date,
    age: String,
    amka: { type: String, required: true, unique: true },
    amedcode: String,
    email: String,
    mobilephone: String,
    address: String,
    height: String,
    weight: String,
    bloodtype: String,
    medicines: [String],  // Assuming medicines are strings in an array
    chronicDiseases: String,
    chronicMedicines: String,
    pastOperations: String,
    allergies: String,
    isSmoking: Boolean,
    isDrinking: Boolean,
    supervisorDoctor: String,
    isPreoperation: Boolean,
    currentStage: String,
    legOperation: String,
    entryDate: Date,
    operationDate: Date,
    exitDate: Date,
    preInstructions: [String], // Assuming instructions are strings in an array
    preExercises: [String], // Assuming exercises are strings in an array
    medicalFiles: String,
    registrationDate: Date,
    itsAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    password: { type: String, required: true },
    fcmToken: {
        type: String,
        default: null
    },
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
