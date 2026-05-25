import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    messages: [
        {
            sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
            text: { type: String, default: '' }, 
            messageType: { 
                type: String, 
                enum: ['text', 'image', 'pdf'], 
                default: 'text' 
            },
            mediaUrl: {type: String},
            fileName: { type: String },
            timestamp: { type: Date, default: Date.now },
            isRead: { type: Boolean, default: false },
        },
    ],
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);