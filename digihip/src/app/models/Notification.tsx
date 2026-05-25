import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotificationItem {
  doctor_id?: Types.ObjectId;
  title: string;
  message: string;
  notifyPeriod: 'once' | '12h' | '1day' | '2days' | '5days' | '1week' | '2weeks' | '1month' | '2months' | '4months' | '6months' | '1year';
  isActive: boolean;
  refID: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  patient_id: Types.ObjectId;
  notifications: INotificationItem[];
}

const NotificationItemSchema = new Schema<INotificationItem>({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, 
  title: { type: String, required: true },
  message: { type: String, required: true },
  notifyPeriod: {
    type: String,
    enum: ['once', '12h', '1day', '2days', '5days', '1week', '2weeks', '1month', '2months', '4months', '6months', '1year'],
    default: 'once',
  },
  isActive: { type: Boolean, default: true },
  refID: { type: String, default: null }, 
}, { timestamps: true });

const NotificationSchema = new Schema<INotification>({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  notifications: [NotificationItemSchema],
});

// Define indexes
NotificationSchema.index({ patient_id: 1 }); // For finding all notifications for a patient
NotificationSchema.index({ 'notifications._id': 1 }); // For finding specific notifications
NotificationSchema.index({ 'notifications.refID': 1 }); // For finding by Agenda job ID

const NotificationModel = mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', NotificationSchema);

// Ensure indexes are created when the model is initialized
NotificationModel.createIndexes().catch(err => {
  console.error('Notification model index creation error:', err);
});

export default NotificationModel;
