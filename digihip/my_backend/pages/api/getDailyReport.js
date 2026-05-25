import connectMongo from '../../lib/mongodb';
import authenticateToken from '../../middleware/authMiddleware';
import mongoose from 'mongoose';

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
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectMongo();
        authenticateToken(req, res, async () => {
            const { amka } = req.query;
            
            if (!amka || !/^\d{11}$/.test(amka)) {
                return res.status(400).json({ success: false, message: 'Invalid AMKA format' });
            }

            const result = await DailyReport.find({ amka }).sort({ date: -1 }).limit(1); // sorts daily reports by date and returns only the most recent 
            // console.log(result);
            if (!result) {
                return res.status(404).json({ success: false, message: 'No daily reports found' });
            }

            res.status(200).json({ success: true, last: result });
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
