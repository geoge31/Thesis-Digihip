import connectMongo from '../../lib/mongodb';
import Message from '../../models/Message';
import authenticateToken from '../../middleware/authMiddleware';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectMongo();
        authenticateToken(req, res, async () => {
            const { patient_id } = req.query;

            if (!mongoose.Types.ObjectId.isValid(patient_id)) {
                return res.status(400).json({ success: false, message: 'Invalid patient_id format' });
            }

            const result = await Message.findOne({ patient_id });

            if (!result) {
                return res.status(404).json({ success: false, message: 'No messages found' });
            }

            res.status(200).json({ success: true, messages: result.messages });
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
