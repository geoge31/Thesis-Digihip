import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminder {
    patient_id: Types.ObjectId;
    // notification_id: string;
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: boolean;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    // notification_id: {type: String, required: true},
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {type: String},
    isRead: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

ReminderSchema.index({ patient_id: 1 });
ReminderSchema.index({ patient_id: 1, isRead: 1 });

export default mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);