import connectMongo from '../../../lib/mongodb';
// import Notification from '../../../models/Notification';
import Reminder from '../../../models/Reminder';
import authenticateToken from '../../../middleware/authMiddleware';
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
            // const [reminders, notificationDoc] = await Promise.all([
            //     Reminder.find({ patient_id }),
            //     Notification.findOne({ patient_id }),
            // ]);

            const reminder = await Reminder.find({patient_id});

            if (!reminders) {
                return res.status(404).json({ success: false, message: 'No reminders found'});
            }

            // if (!notificationDoc) {
            //     return res.status(404).json({ success: false, message: 'No notifications found'});
            // }
            
            // Count unread reminders
            const unreadcount = reminders.reduce((count, reminder) => (
                reminder.isRead ? count : count + 1
            ), 0);

            
            // const notificationMap = new Map();
            // // Loop through all notification documents
            // notificationDoc.notifications.forEach(notification => {
            //     notificationMap.set(notification._id.toString(), {
            //       title: notification.title,
            //       message: notification.message,
            //     });
            // });
            
            // // Add title/message to each reminder
            // const enrichedReminders = reminders.map(reminder => {
            //     const note = notificationMap.get(reminder.notification_id);
            //     return {
            //       ...reminder.toObject(),
            //       title: note?.title || null,
            //       message: note?.message || null,
            //     };
            // });

            res.status(200).json({ success: true, notifications: reminders, unreadcount });
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
