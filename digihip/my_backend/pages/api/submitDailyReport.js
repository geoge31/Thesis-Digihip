import connectMongo from '../../lib/mongodb';
import mongoose from 'mongoose';
import authenticateToken from '../../middleware/authMiddleware';

const DailyReportSchema = new mongoose.Schema({
    amka: String, // AMKA του χρήστη για τον εντοπισμό του
    injectionDone: Boolean, // Απάντηση για την αντιπηκτική ένεση
    exercisesDone: Boolean, // Απάντηση για τις ασκήσεις
    painLevel: Number, // Επίπεδο πόνου από το slider
    painCategory: String, // Κατηγορία πόνου (Ήπιος, Μέτριος, Σοβαρός)
    date: {
        type: Date,
        default: Date.now, // Ημερομηνία του report
    },
});

const DailyReport = mongoose.models.DailyReport || mongoose.model('DailyReport', DailyReportSchema, 'daily_reports');

export default async function handler(req, res) {
    await connectMongo();

    // Εφαρμογή middleware
    authenticateToken(req, res, async () => {
        if (req.method === 'POST') {
            try {
                const { amka, injectionDone, exercisesDone, painLevel, painCategory } = req.body;

                console.log('Received data:', req.body);

                const newReport = new DailyReport({
                    amka,
                    injectionDone,
                    exercisesDone,
                    painLevel,
                    painCategory,
                });

                try {
                    await newReport.save();
                    console.log("Report saved successfully in MongoDB");
                } catch (error) {
                    console.error("MongoDB Save Error:", error);
                }
                
                console.log("Report saved successfully");
                res.status(200).json({ success: true, message: 'Daily report submitted successfully.' });
            } catch (error) {
                console.error('Error submitting daily report:', error);
                res.status(500).json({ success: false, error: 'Failed to submit daily report.' });
            }
        } else {
            res.status(405).json({ success: false, error: 'Method not allowed.' });
        }
    });
}
