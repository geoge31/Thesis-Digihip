// lib/jobs/defineJobs.ts
import { NextResponse } from 'next/server';
import {agenda} from '@/lib/agenda';
import Patient from '@/models/Patient';
import dbConnect from '@/lib/dbConnect';
import Reminder from '@/models/Reminder'; 
import admin from '../firebaseAdmin';
import mongoose from "mongoose";

agenda.define("reminder", async (job) => {
    await dbConnect();
    try {
        const { patientId, notification } = job.attrs.data;
        if (!patientId || !notification) {
            console.error('Invalid job data, in daily job(ID: ${job.attrs._id}):', job.attrs.data);
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return;
        }
        
        const patient = await Patient.findById(patientId);
        // if patient exists create a reminder
        if(patient) {
            const newReminder = {
                patient_id: patientId,
                // notification_id: notification.id,
                title: notification.title,
                message: notification.message,
                isRead: false,
                isCompleted: false,
            };
        
            await Reminder.create(newReminder);
        }
        else {
            // TODO: patient is deleted - remove the job from Agenda
            console.warn(`Patient ${patientId} not found. Removing agenda job...`);
            await job.remove();
            return;
        }
        
        // if patient has not registered device, return
        if(!patient?.fcmToken){
            // console.warn(`No FCM token for patient ${patientId}. Skipping notification.`);
            return;
        }  
        //Otherwise send him notification
        await admin.messaging().send({
            token: patient.fcmToken,
            notification: {
                title: 'Νέα Eιδοποίηση',
                body: `${notification.title}: ${notification.message}`,
            },
            android: {
                priority: 'high',
                notification: {
                    visibility: 'PUBLIC',
                    sound: 'default',
                    channelId: 'default',
                    icon: "ic_notification",
                },
            },
            data: {
                type: 'reminder',
                patient_id: patientId,
            },
        });

        console.log('Daily Reminder was sent and saved to DB');
    } catch(error) {
        console.error('Error in daily reminder job (ID: ${job.attrs._id}):', error);
    }
});

agenda.define("once", async (job) => {
    await dbConnect();
    try {
        const { patientId, notification } = job.attrs.data;
        if (!patientId || !notification) {
            console.error('Invalid job data, in job(ID: ${job.attrs._id}):', job.attrs.data);
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return;
        }
        
        const patient = await Patient.findById(patientId);
        // if patient exists send him reminder
        if(patient) {
            const newReminder = {
                patient_id: patientId,
                // notification_id: notification.id,
                title: notification.title,
                message: notification.message,
                isRead: false,
                isCompleted: false,
            };
        
            await Reminder.create(newReminder);
        }
        else {
            // TODO: patient is deleted - remove the job from Agenda
            console.warn(`Patient ${patientId} not found. Removing agenda job...`);
            await job.remove();
            return;
        }
        
        if(!patient?.fcmToken){
            // console.warn(`No FCM token for patient ${patientId}. Skipping notification.`);
            return;
        }  
        await admin.messaging().send({
            token: patient.fcmToken,
            notification: {
                title: 'Νέα Eιδοποίηση',
                body: `${notification.title}: ${notification.message}`,
            },
            android: {
                priority: 'high',
                notification: {
                    visibility: 'PUBLIC',
                    sound: 'default',
                    channelId: 'default',
                    icon: "ic_notification",
                },
            },
            data: {
                type: 'reminder',
                patient_id: patientId,
            },
        });

        // console.log('Reminder was sent and saved to DB');
    } catch(error) {
        console.error('Error in reminder job:', error);
    }
});  

agenda.define("recurring", async (job) => {
    await dbConnect();
    try {
        const { patientId, notification } = job.attrs.data;
        if (!patientId || !notification) {
            console.error('Invalid job data, in daily job(ID: ${job.attrs._id}):', job.attrs.data);
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return;
        }
        
        const patient = await Patient.findById(patientId);
        // if patient exists send him reminder
        if(patient) {
            const newReminder = {
                patient_id: patientId,
                // notification_id: notification.id,
                title: notification.title,
                message: notification.message,
                isRead: false,
                isCompleted: false,
            };
        
            await Reminder.create(newReminder);
        }
        else {
            // TODO: patient is deleted - remove the job from Agenda
            console.warn(`Patient ${patientId} not found. Removing agenda job...`);
            await job.remove();
            return;
        }
        
        // if patient has not registered device, return
        if(!patient?.fcmToken){
            // console.warn(`No FCM token for patient ${patientId}. Skipping notification.`);
            return;
        }  
        //Otherwise send him notification
        await admin.messaging().send({
            token: patient.fcmToken,
            notification: {
                title: 'Νέα Eιδοποίηση',
                body: `${notification.title}: ${notification.message}`,
            },
            android: {
                priority: 'high',
                notification: {
                    visibility: 'PUBLIC',
                    sound: 'default',
                    channelId: 'default',
                    icon: "ic_notification",
                },
            },
            data: {
                type: 'reminder',
                patient_id: patientId,
            },
        });

        // console.log('Daily Reminder was sent and saved to DB');
    } catch(error) {
        console.error('Error in recurring reminder job (ID: ${job.attrs._id}):', error);
    }
});

agenda.define("appointment", async (job) => {
    await dbConnect();
    
    try {
        const { patientId, date } = job.attrs.data;
        if (!patientId || !date) {
            console.error('Invalid job data, in job(ID: ${job.attrs._id}):', job.attrs.data);
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return;
        }
        const patient = await Patient.findById(patientId);
        // if patient exists send him reminder
        if(patient) {
            const newReminder = {
                patient_id: patientId,
                title: 'Υπενθύμιση για Ραντεβού',
                message: `Το ραντεβού σας είναι στις ${date}`,
                category: `appointment`,
                isRead: false,
                isCompleted: false,
            };
        
            await Reminder.create(newReminder);
        }
        else {
            // TODO: patient is deleted - remove the job from Agenda
            console.warn(`Patient ${patientId} not found. Removing agenda job...`);
            await job.remove();
            return;
        }
        
        if(!patient?.fcmToken){
            // console.warn(`No FCM token for patient ${patientId}. Skipping notification.`);
            return;
        }  
        await admin.messaging().send({
            token: patient.fcmToken,
            notification: {
                title: 'Υπενθύμιση για Ραντεβού',
                body: `Το ραντεβού σας είναι στις ${date}`,
            },
            android: {
                priority: 'high',
                notification: {
                    visibility: 'PUBLIC',
                    sound: 'default',
                    channelId: 'default',
                    icon: "ic_notification",
                },
            },
            data: {
                type: 'appointment',
                patient_id: patientId,
            },
        });

        // console.log('Reminder was sent and saved to DB');
    } catch(error) {
        console.error('Error in reminder job:', error);
    }
});  
