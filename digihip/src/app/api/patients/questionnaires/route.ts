/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description : API route for fetching patient questionnaires based on AMKA
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

        const mongoose = require('mongoose');
        const QuestionnaireSchema = new mongoose.Schema({
            amka: String,
            mobility: Number,
            selfCare: Number,
            usualActivities: Number,
            pain: Number,
            anxiety: Number,
            submittedAt: {
                type: Date,
                default: Date.now,
            },
        });

        const Questionnaire = mongoose.models.Questionnaire || mongoose.model('Questionnaire', QuestionnaireSchema, 'questionnaires');

        const questionnaires = await Questionnaire.find({ amka }).sort({ submittedAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            questionnaires: questionnaires || [],
        });
    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch questionnaires' },
            { status: 500 }
        );
    }
}
