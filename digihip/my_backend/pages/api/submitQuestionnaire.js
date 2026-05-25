import connectMongo from '../../lib/mongodb';
import mongoose from 'mongoose';
import authenticateToken from '../../middleware/authMiddleware';

const QuestionnaireSchema = new mongoose.Schema({
    amka: String, // Προσθήκη του πεδίου AMKA
    mobility: Number,
    selfCare: Number,
    usualActivities: Number,
    pain: Number,
    anxiety: Number,
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

const Questionnaire = mongoose.models.Questionnaire || mongoose.model('Questionnaire', QuestionnaireSchema);

export default async function handler(req, res) {
    await connectMongo();

    // Εφαρμογή middleware
    authenticateToken(req, res, async () => {
        if (req.method === 'POST') {
            try {
                const { amka, mobility, selfCare, usualActivities, pain, anxiety } = req.body;

                const newEntry = new Questionnaire({
                    amka,
                    mobility,
                    selfCare,
                    usualActivities,
                    pain,
                    anxiety,
                });

                await newEntry.save();
                res.status(200).json({ success: true, message: 'Questionnaire submitted successfully.' });
            } catch (error) {
                console.error('Error submitting questionnaire:', error);
                res.status(500).json({ success: false, error: 'Failed to submit questionnaire.' });
            }
        } else {
            res.status(405).json({ success: false, error: 'Method not allowed.' });
        }
    });
}
