import connectMongo from '../../../lib/mongodb';
import Reminder from '../../../models/Reminder';
import authenticateToken from '../../../middleware/authMiddleware';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        await connectMongo();
        authenticateToken(req, res, async () => {
            const { patient_id } = req.body;
            
            if (!mongoose.Types.ObjectId.isValid(patient_id)) {
                return res.status(400).json({ success: false, message: 'Invalid patient_id format' });
            }
            const result = await Reminder.updateMany({ 
                    patient_id: patient_id, 
                    isRead: false 
                }, { 
                $set: { 
                    isRead: true
                } 
            });
            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: 'No reminders found to update' });
            }
            res.status(200).json({ success: true });
        });
    } catch (error) {
        console.error('Error updating reminders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}