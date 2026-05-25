// lib/agenda.js
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' });
import { Agenda } from 'agenda';

const mongoConnectionString = 'mongodb+srv://giorgosgts1999:3efKH74k1jUG3rkI@cluster0.b3pvc.mongodb.net/digihip?retryWrites=true&w=majority&appName=Cluster0';

const agenda = new Agenda({
  db: { 
    address: mongoConnectionString, 
    collection: 'agendaJobs' 
  },
  defaultConcurrency: 5,
});

const ready = agenda.start().then(() => {
  console.log('Agenda started');
});

export { agenda, ready };