/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description API route for fetching daily reports of a patient based on their AMKA
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const amka = searchParams.get('amka');

        if (!amka) {
            return NextResponse.json(
                { success: false, message: 'AMKA is required' },
                { status: 400 }
            );
        }

        if (!/^\d{11}$/.test(amka)) {
            return NextResponse.json(
                { success: false, message: 'Invalid AMKA format' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Import the model dynamically to avoid connection issues
        const mongoose = require('mongoose');
        const DailyReportSchema = new mongoose.Schema({
            amka: String,
            injectionDone: Boolean,
            exercisesDone: Boolean,
            painLevel: Number,
            painCategory: String,
            date: {
                type: Date,
                default: Date.now,
            },
        });

        const DailyReport = mongoose.models.DailyReport || mongoose.model('DailyReport', DailyReportSchema, 'daily_reports');

        const reports = await DailyReport.find({ amka }).sort({ date: -1 }).lean();

        return NextResponse.json({
            success: true,
            reports: reports || [],
        });
    } catch (error) {
        console.error('Error fetching daily reports:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch daily reports' },
            { status: 500 }
        );
    }
}
