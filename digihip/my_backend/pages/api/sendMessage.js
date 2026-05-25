import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import connectMongo from '../../lib/mongodb';
import Message from '../../models/Message';
import authenticateToken from '../../middleware/authMiddleware';
import mongoose from 'mongoose';

export const config = {
    api: {
      bodyParser: false, // Important: Disable Next.js default body parsing
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  
    const form = new IncomingForm({
        multiples: false,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit for files
    });
  
    // Set upload directory and create it if not exists
    const uploadDir =  path.join(process.cwd(), '../public', 'uploads');
    console.log('Upload directory:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  
    form.uploadDir = uploadDir;
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(500).json({ success: false, message: 'Error parsing form data' });
      }
  
      try {
        await connectMongo();
        authenticateToken(req, res, async () => {
          const patient_id = Array.isArray(fields.patient_id) ? fields.patient_id[0] : fields.patient_id;
          const sender_id = Array.isArray(fields.sender_id) ? fields.sender_id[0] : fields.sender_id;
          const text = Array.isArray(fields.text) ? fields.text[0] : fields.text;
          const messageType = Array.isArray(fields.messageType) ? fields.messageType[0] : fields.messageType;

          if (!mongoose.Types.ObjectId.isValid(patient_id) || !mongoose.Types.ObjectId.isValid(sender_id)) {
            return res.status(400).json({ success: false, message: 'Invalid patient_id or sender_id format' });
          }
  
          let fileName = '';
          let mediaUrl = '';
  
          // Handle file if uploaded
          if (files.file) {
            const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;
          
            if (!uploaded.originalFilename) {
              console.error('originalFilename is missing:', uploaded);
              return res.status(400).json({ success: false, message: 'Uploaded file is invalid or missing filename.' });
            }
          
            const ext = path.extname(uploaded.originalFilename);
            const baseName = path.basename(uploaded.originalFilename, ext);

            // Replace problematic characters with underscore
            const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');

            const uniqueName = `${safeBaseName}_${Date.now()}${ext}`;
            const destPath = path.join(uploadDir, uniqueName);
          
            fs.renameSync(uploaded.filepath, destPath);
            fileName = uniqueName;

            // After saving file (renameSync), build the URL:
            const baseUrl = 'http://139.91.210.34';
            mediaUrl = `${baseUrl}/uploads/${encodeURIComponent(uniqueName)}`;
          }

          const newMessage = {
            sender_id,
            text: text || '',
            messageType: messageType || 'text',
            mediaUrl, 
            fileName: fileName || '',
            timestamp: new Date(),
            isRead: false,
          };
  
          let messageDoc = await Message.findOne({ patient_id });
  
          if (messageDoc) {
            messageDoc.messages.push(newMessage);
            await messageDoc.save();
          } 
          else {
            messageDoc = new Message({
              patient_id,
              messages: [newMessage]
            });
            await messageDoc.save();
          }
          
          res.status(200).json({ success: true, message: newMessage });
        });
      } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    });
  }
