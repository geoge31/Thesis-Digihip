import mongoose, { Schema, Document } from 'mongoose';

interface IMessageDetail {
  sender_id: mongoose.Schema.Types.ObjectId; // sender ID
  text: string;
  messageType: 'text' | 'image' | 'pdf';
  mediaUrl: string,
  fileName: string,
  timestamp: Date,
  isRead: boolean; // To track if the message is read
}

interface IMessage extends Document {
  patient_id: mongoose.Schema.Types.ObjectId; // patient ID
  messages: IMessageDetail[];
}

const MessageSchema: Schema = new Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  messages: [
    {
      sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      text: { type: String },
      messageType: { 
        type: String, 
        enum: ['text', 'image', 'pdf'], 
        default: 'text' 
      },
      mediaUrl: {type: String},
      fileName: { type: String },
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false }, // Default to false (unread)
    },
  ],
});

// Optional: Add an index on messages.isRead to optimize unread messages queries
MessageSchema.index({ 'messages.isRead': 1, 'messages.sender_id': 1 });

// Optional: Helper method to mark all messages as read
MessageSchema.methods.markMessagesAsRead = async function () {
  this.messages.forEach((message: IMessageDetail) => {
    message.isRead = true;
  });
  return this.save();
};

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
