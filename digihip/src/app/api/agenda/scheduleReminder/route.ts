// api/agenda/scheduleReminder.ts

// This file is not usefull at all, while the reminders are scheduled direct on api/notifications
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' });

import { NextRequest, NextResponse } from 'next/server';
import {agenda, ready } from '@/lib/agenda';

export async function POST(req: NextRequest) {
    const { patientId, notifications } = await req.json();

    for (const notification of notifications) { 
        if(notification.category === 'Προεπιλεγμένη') {
            if(notification.title === 'Καθημερινή Υγεία') {
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
                    default:
                        break;
                }
                await ready; // checks if agenda has started
                const job = agenda.create('reminder', {
                    patientId,
                    notification
                });
                    
                job.unique({
                    'data.patientId': patientId,
                    'data.notification.id': notification.id
                });
                    
                await job.repeatEvery('1 min', {
                    catchUp: true 
                });
                const savedJob = await job.save();
                const jobId = savedJob.attrs._id; 

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
                            notificationId: notification.id,
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
            else {
                switch(notification.message) {
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
                const job = agenda.create('once', {
                    patientId,
                    notification
                });
                    
                job.unique({
                    'data.patientId': patientId,
                    'data.notification.id': notification.id
                });
                    
                // Schedule it to run now (or at a specific time)
                await job.schedule(new Date());
                const savedJob = await job.save();
                const jobId = savedJob.attrs._id;

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
                            notificationId: notification.id,
                            jobId: jobId, 
                        }),
                    });

                    if (!updateResponse .ok) throw new Error('HTTP error: update notification');
                
                    const updateResult = await updateResponse.json();
                    
                    if(!updateResult.success) throw new Error('Failed to update notification');
                    
                } catch(error) {
                    console.error(`Error processing ${notification.message}:`, error);
                }
            }
        }    
        else {
            switch(notification.notifyPeriod){
                case 'once': {
                    await ready; // checks if agenda has started
                    const job = agenda.create('once', {
                        patientId,
                        notification
                    });
                        
                    job.unique({
                        'data.patientId': patientId,
                        'data.notification.id': notification.id
                    });
                        
                    // Schedule it to run now (or at a specific time)
                    await job.schedule(new Date());
                    const savedJob = await job.save();
                    const jobId = savedJob.attrs._id;
    
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
                                notificationId: notification.id,
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
                    
                    await ready; // checks if agenda has started
                    const job = agenda.create('recurring', {
                        patientId,
                        notification
                    });

                    job.unique({
                        'data.patientId': patientId,
                        'data.notification.id': notification.id
                    });

                    await job.repeatEvery(interval, { catchUp: true });
                    const savedJob = await job.save();
                    const jobId = savedJob.attrs._id;

                    try {
                        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: "updateJobId", patientId, notificationId: notification.id, jobId })
                        });

                        if (!updateResponse.ok) throw new Error('HTTP error: update notification');

                        const updateResult = await updateResponse.json();
                        if (!updateResult.success) throw new Error('Failed to update notification');

                    } catch (error) {
                        console.error(`Error processing ${notification.message}:`, error);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
    
    return NextResponse.json({ success: true });
}