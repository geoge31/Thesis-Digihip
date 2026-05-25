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
      const { patient_id } = req.body;

      const patient = await Patient.findById(patient_id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

      patient.fcmToken = null;
      await patient.save();

      res.status(200).json({ success: true, message: 'FCM token removed' });
    });
  } catch (error) {
    console.error('Error nullifying token:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}