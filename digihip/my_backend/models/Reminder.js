import mongoose from 'mongoose';

const ReminderSchema =  new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    // notification_id: {type: String, required: true},
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {type: String},
    isRead: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);