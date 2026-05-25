import connectMongo from '../../lib/mongodb';
import Appointment from '../../models/Appointment';
import Patient from '../../models/Patient';
import authenticateToken from '../../middleware/authMiddleware';

export default async function handler(req, res) {
    await connectMongo();

    // Εφαρμογή middleware
    authenticateToken(req, res, async () => {
        const { method } = req;

        if (method === 'GET') {
            const { amka } = req.query;

            if (!amka) {
                return res.status(400).json({ success: false, message: 'Το AMKA είναι απαραίτητο.' });
            }

            try {
                // Εύρεση ασθενούς βάσει AMKA
                const patient = await Patient.findOne({ amka });
                if (!patient) {
                    return res.status(404).json({ success: false, message: 'Ο ασθενής δεν βρέθηκε.' });
                }

                // Εύρεση ραντεβού του ασθενούς
                const appointments = await Appointment.find({ appointmentPatient: patient._id });

                return res.status(200).json({ success: true, appointments });
            } catch (error) {
                console.error('Error fetching appointments:', error);
                return res.status(500).json({ success: false, message: 'Σφάλμα κατά την ανάκτηση των ραντεβού.' });
            }
        } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
    });
}
