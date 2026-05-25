// pages/api/agenda/handleJob.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { agenda , ready } from '@/lib/agenda';

export async function POST(request: Request) {
  try {
    const { refID, isActive } = await request.json();

    if (!refID || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }
    // convert string to ObjectId type 
    const objectId = new mongoose.Types.ObjectId(refID);
    await ready;
    // agenda doesnt accept string
    const jobs = await agenda.jobs({ _id: objectId });
    if (jobs.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    if (isActive) {
      job.disable();
    } else {
      job.enable();
    }

    await job.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling job:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}