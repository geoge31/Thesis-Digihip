import mongoose from 'mongoose';

const NotificationSchema =  new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    unreadCount: { type: Number, default: 0 },
    notifications: [{
        doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        title: { type: String, required: true },
        message: { type: String, required: true },
        notifyPeriod: {
            type: String,
            enum: ['once', '12h', '1day', '2days', '5days', '1week', '2weeks', '1month', '2months', '4months', '6months', '1year'],
            default: 'once',
        },
        isRead: { type: Boolean, default: false },
    }],
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);