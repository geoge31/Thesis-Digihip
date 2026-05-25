// my_backend/pages/api/auth/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectMongo from '../../../lib/mongodb';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { amka, password } = req.body;

    try {
        await connectMongo();

        // Αναζήτηση του ασθενή με το AMKA
        const patient = await Patient.findOne({ amka });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'AMKA not found' });
        }

        // Έλεγχος αν το password ταιριάζει
        /*const isPasswordValid = await bcrypt.compare(password, patient.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }*/

        // Έλεγχος αν το password ταιριάζει - χωρίς bcrypt
        const isPasswordValid = password === patient.password;
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Δημιουργία JWT token
        const token = jwt.sign({ amka: patient.amka, id: patient._id }, process.env.JWT_SECRET, {
            // expiresIn: '1h',
        });

        // Επιστροφή token και ασθενή
        return res.status(200).json({ 
            success: true, 
            token, 
            patient: { 
                _id: patient._id, 
                amka: patient.amka, 
                firstname: patient.firstname, 
                lastname: patient.lastname 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
