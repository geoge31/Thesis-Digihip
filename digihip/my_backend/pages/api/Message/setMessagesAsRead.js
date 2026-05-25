import connectMongo from '../../../lib/mongodb';
import Message from '../../../models/Message';
import authenticateToken from '../../../middleware/authMiddleware';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        await connectMongo();
        authenticateToken(req, res, async () => {
            const { patient_id } = req.body;
            
            if (!mongoose.Types.ObjectId.isValid(patient_id)) {
                return res.status(400).json({ success: false, message: 'Invalid patient_id format' });
            }

            // Update only messages where sender_id is NOT the patient_id
            const result = await Message.findOneAndUpdate(
                { patient_id },
                { $set: { "messages.$[msg].isRead": true } }, 
                { 
                    arrayFilters: [{ "msg.sender_id": { $ne: patient_id } }], // Filter messages where sender_id !== patient_id
                    new: true
                }
            );

            if (!result) {
                return res.status(404).json({ success: false, message: 'No messages found for this patient' });
            }
            res.status(200).json({ success: true, message: 'Messages marked as read'});
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}