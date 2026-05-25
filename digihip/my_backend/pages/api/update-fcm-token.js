import connectMongo from '../../lib/mongodb';
import Patient from '../../models/Patient';
import authenticateToken from '../../middleware/authMiddleware';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectMongo();
        authenticateToken(req, res, async () => {
            const { patient_id, fcmToken } = req.body;

            if (!mongoose.Types.ObjectId.isValid(patient_id)) {
                return res.status(400).json({ success: false, message: 'Invalid patient_id' });
            }

            const patient = await Patient.findById(patient_id);
            if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

            if (!patient.fcmToken || patient.fcmToken !== fcmToken) {
                patient.fcmToken = fcmToken;
                await patient.save();
            }

            res.status(200).send({ success: true });
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
