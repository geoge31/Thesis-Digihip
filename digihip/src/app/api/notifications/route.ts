import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Notification from '@/models/Notification'; 
import { agenda, ready } from '../../lib/agenda';
import '@/lib/jobs/defineJobs';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { patientId, notifications, doctorId } = await req.json();

    if (!patientId || !notifications || !doctorId || !Array.isArray(notifications)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const existing = await Notification.findOne({ patient_id: patientId });

    let createdSubdocs: any[] = [];

    const newNotifications = notifications.map((n: any) => ({
      doctor_id: doctorId, // unnecessary, but just in case
      title: n.title,
      message: n.message,
      notifyPeriod: n.notifyPeriod || 'once',
      refID: null,
      isActive: true,
    }));
    
    if (existing) {
      existing.notifications.push(...newNotifications);
      await existing.save();
      const startIndex = existing.notifications.length - newNotifications.length;
      createdSubdocs = existing.notifications.slice(startIndex);
    } else {
      const created = await Notification.create({
        patient_id: patientId,
        notifications: newNotifications,
      });
      
      createdSubdocs = created.notifications;
    }
    
    newNotifications.forEach((n, i) => {
      n._id = createdSubdocs[i]._id;
    });

    for (const notification of newNotifications) { 
      switch(notification.message) {
        case 'Να λαμβάνει τα φάρμακά του.':
          notification.message =  'Να λαμβάνετε τα φάρμακά σας.'
          break;
        case 'Να κάνει την ένεση του.':
          notification.message =  'Να κάνετε την ένεσή σας.'
          break;
        case 'Να μείνει ενυδατωμένος και να τρώει καλά.':
          notification.message =  ' Να μένετε ενυδατωμένος/η και να τρέφεστε σωστά.'
          break;
        case 'Να μετρήσει την πίεση του.':
          notification.message =  'Να μετράτε την πίεσή σας.'
          break;
        case 'Να κάνει τις διατάσεις του και να ακολουθεί τις οδηγίες του φυσικοθεραπευτή.':
          notification.message =  'Να κάνετε τις διατάσεις σας και να ακολουθείτε τις οδηγίες του φυσικοθεραπευτή σας.'
          break;
        case 'Να μην καταπονεί το τραυματισμένο σημείο. Αν χρειάζεται να χρησιμοποιεί πατερίτσες.':
          notification.message =  'Μην καταπονείτε το τραυματισμένο σημείο. Αν χρειάζεται, χρησιμοποιήστε πατερίτσες.'
          break;
        case 'Αν εμφανιστεί έντονος πόνος, πρήξιμο, πυρετός ή κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό.':
          notification.message =  'Αν εμφανιστεί έντονος πόνος, πρήξιμο, πυρετός ή κάτι ασυνήθιστο, επικοινωνήστε με τον γιατρό σας.'
          break;
        case 'Αν παρατηρήσει κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό άμεσα.':
          notification.message =  'Αν παρατηρήσετε κάτι ασυνήθιστο, επικοινωνήστε άμεσα με τον γιατρό.'
          break;
        case 'Εάν ο πόνος είναι μη διαχειρίσιμος, να λάβει παυσίπονα και χρήση πάγου.':
          notification.message =  'Αν ο πόνος δεν είναι διαχειρίσιμος, πάρτε παυσίπονα και εφαρμόστε πάγο.'
          break;    
        default:
          break;
      }
      await ready; // checks if agenda has started
      switch(notification.notifyPeriod){
        case 'once': {
            const job = agenda.create('reminder', {
              patientId,
              notification
            });
                
            job.unique({
              'data.patientId': patientId,
              'data.notification._id': notification._id
            });
                
            // Schedule it to run now (or at a specific time)
            await job.schedule(new Date());
            const savedJob = await job.save();
            const jobId = savedJob.attrs._id;
            notification.refID = jobId;
            // pass the jobID to corresponded notification for future deletations or pauses/unpauses
            try {
              const updateResponse  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                } ,
                body: JSON.stringify({
                  action: "updateJobId",
                  patientId,
                  notificationId: notification._id,
                  jobId: jobId, 
                }),
              });

              if (!updateResponse .ok) throw new Error('HTTP error: update notification');
            
              const updateResult = await updateResponse.json();
                
              if(!updateResult.success) throw new Error('Failed to update notification');
                
            } catch(error) {
              console.error(`Error processing ${notification.message}:`, error);
            }
            break;
        }
        case '12h':
        case '1day':
        case '2days':
        case '5days':
        case '1week':
        case '2weeks':
        case '1month':
        case '2months':
        case '4months':
        case '6months':
        case '1year': {
          const intervalMap = {
            '12h': '12 hours',
            '1day': '1 day',
            '2days': '2 days',
            '5days': '5 days',
            '1week': '1 week',
            '2weeks': '2 weeks',
            '1month': '1 month',
            '2months': '2 months',
            '4months': '4 months',
            '6months': '6 months',
            '1year': '1 year'
          };

          const interval = intervalMap[notification.notifyPeriod];
          const job = agenda.create('reminder', {
            patientId,
            notification
          });

          job.unique({
            'data.patientId': patientId,
            'data.notification._id': notification._id
          });

          await job.repeatEvery(interval, { catchUp: true });
          const savedJob = await job.save();
          const jobId = savedJob.attrs._id;
          notification.refID = jobId;
          try {
            const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: "updateJobId", patientId, notificationId: notification._id, jobId })
            });

            if (!updateResponse.ok) throw new Error('HTTP error: update notification');

            const updateResult = await updateResponse.json();
            if (!updateResult.success) throw new Error('Failed to update notification');

          } catch (error) {
            console.error(`Error processing ${notification.message}:`, error);
          }
          break;
        }
        default: 
          break;
      }
    }

    return NextResponse.json({ success: true, notifications: newNotifications });
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const patientId = req.nextUrl.searchParams.get('patient_id');
  
  if (!patientId) {
    return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
  }

  try {
    const data = await Notification.findOne({ patient_id: patientId });
    return NextResponse.json(data || {});
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { action } = body;
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }
    
    switch(action) {
      case 'updateJobId':{
        const { patientId, notificationId, jobId } = body;

        if (!patientId || !notificationId || !jobId) {
          return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const result = await Notification.findOneAndUpdate({ 
            patient_id: patientId,
            'notifications._id': notificationId 
          },{ 
            $set: { 
              'notifications.$[matched].refID': jobId 
            } 
          },{ 
            arrayFilters: [{ 'matched._id': notificationId }],
          }
        );
        
        if (!result) {
          return NextResponse.json({ success: false, message: 'Notification not found' });
        }
        break;
      }
      case 'toggleActive': {
        const { patientId, notificationId, isActive } = body;
        
        if (!patientId || !notificationId || typeof isActive !== 'boolean') {
          return NextResponse.json({ error: 'Invalid input for toggleActive' }, { status: 400 });
        }

        const activity = !isActive;
        const result = await Notification.findOneAndUpdate({ 
            patient_id: patientId,
            'notifications._id': notificationId 
          },{ 
            $set: { 
              'notifications.$[matched].isActive': activity,
            } 
          },{ 
            arrayFilters: [{ 'matched._id': notificationId }],
          }
        );
        
        if (!result) {
          return NextResponse.json({ success: false, message: 'Notification not found' });
        }      
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  try {
    const { patientId, notificationId } = await req.json();

    if (!patientId || !notificationId) {
      return NextResponse.json({ error: 'Missing patientId or notificationId' }, { status: 400 });
    }

    const notificationDoc = await Notification.findOne({patient_id: patientId});
    if (!notificationDoc) {
      return NextResponse.json({ error: 'Notification document not found' }, { status: 404 });
    }

    const notificationItem = notificationDoc.notifications.id(notificationId);
    const refID = notificationItem?.refID;

    // Remove the subdocument
    notificationDoc.notifications.pull({ _id: notificationId });
    
    await notificationDoc.save();
    
    // convert string to ObjectId type 
    const objectId = new mongoose.Types.ObjectId(refID);
  
    if (objectId) {
      await ready; // checks if agenda has started
      await agenda.cancel({ _id: objectId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

