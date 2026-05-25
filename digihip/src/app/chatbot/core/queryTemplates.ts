/**
* queryTemplate.ts
* @title Query Templates
* @description Pre-written Mongoose queries with Greek keyword triggers
* @file src\app\chatbot\core\queryTemplates.ts
*
* @version 1.7
* @date 19/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import { preprocessQuestion, scoreKeywords } from "./normalize";

export interface QueryTemplate {
    id: string;
    description: string;
    keywords: string[];
    minScore: number;
    execute: () => Promise<any[]>;
    formatResponse: (data: any[], question: string) => string;
}

export interface QueryResult {
    found: boolean;
    templateId: string;
    response: string;
}

// Helper Functions
function patientName(p: any): string {
    return `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim();
}

function formatDate(date: any): string {
    if (!date) return 'Δεν έχει οριστεί';
    return new Date(date).toLocaleDateString('el-GR');
}

function getTodayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Monday
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

export const queryTemplates: QueryTemplate[] = [

    // Patient Queries
    {
        id: "all-patients",
        description: "Σύνολο ασθενών",
        keywords: ["σύνολο", "ασθενείς", "όλοι", "αριθμός", "πόσοι",
                   "δείξε", "εμφάνισε", "λίστα", "δείξε μου", "εμφάνισε μου"],
        minScore: 2,
        execute: async () => {
            return await Patient.find({ deleted: { $ne: true } })
                .select('firstname lastname currentStage operationDate')
                .lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα") || question.includes("συνολο") || question.includes("αριθμος");
            if (data.length === 0) return "Δεν υπάρχουν ασθενείς στο σύστημα.";
            if (wantsCount) return `Υπάρχουν συνολικά ${data.length} ασθενείς στο σύστημα.`;
            return `Σύνολο ασθενών (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Στάδιο: ${p.currentStage ?? 'Άγνωστο στάδιο'})`).join('\n\n');
        }
    },

    {
        id: "preop-patients",
        description: "Προεγχειρητικοί ασθενείς",
        keywords: ["προεγχειρητικοί", "προεγχειρητικό", "πριν επέμβαση", "ασθενείς", "ποιοι"],
        minScore: 2,
        execute: async () => {
            return await Patient.find({ currentStage: 'ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ', deleted: { $ne: true } })
                .select('firstname lastname operationDate')
                .lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα");
            if (data.length === 0) return "Δεν υπάρχουν προεγχειρητικοί ασθενείς αυτή τη στιγμή.";
            if (wantsCount) return `Υπάρχουν ${data.length} προεγχειρητικοί ασθενείς.`;
            return `Προεγχειρητικοί ασθενείς (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Επέμβαση: ${formatDate(p.operationDate)})`).join('\n\n');
        }
    },

    {
        id: "postop-patients",
        description: "Μετεγχειρητικοί ασθενείς",
        keywords: ["μετεγχειρητικοί", "μετεγχειρητικό", "μετά επέμβαση", "ασθενείς", "ποιοι"],
        minScore: 2,
        execute: async () => {
            return await Patient.find({ currentStage: 'ΜΕΤΕΓΧΕΙΡΗΤΙΚΟ', deleted: { $ne: true } })
                .select('firstname lastname operationDate')
                .lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα");
            if (data.length === 0) return "Δεν υπάρχουν μετεγχειρητικοί ασθενείς αυτή τη στιγμή.";
            if (wantsCount) return `Υπάρχουν ${data.length} μετεγχειρητικοί ασθενείς.`;
            return `Μετεγχειρητικοί ασθενείς (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Επέμβαση: ${formatDate(p.operationDate)})`).join('\n\n');
        }
    },

    {
        id: "patients-operation-today",
        description: "Ασθενείς με επέμβαση σήμερα",
        keywords: ["επέμβαση", "σήμερα", "ασθενείς", "χειρουργείο", "χειρουργηθούν"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getTodayRange();
            return await Patient.find({
                operationDate: { $gte: start, $lte: end },
                deleted: { $ne: true }
            }).select('firstname lastname operationDate legOperation').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα");
            if (data.length === 0) return "Δεν υπάρχουν ασθενείς με επέμβαση σήμερα.";
            if (wantsCount) return `Υπάρχουν ${data.length} ασθενείς με επέμβαση σήμερα.`;
            return `Ασθενείς με επέμβαση σήμερα (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Σκέλος: ${p.legOperation === 'right' ? 'Δεξί' : 'Αριστερό'})`).join('\n\n');
        }
    },

    {
        id: "patients-operation-week",
        description: "Ασθενείς με επέμβαση αυτή την εβδομάδα",
        keywords: ["επέμβαση", "εβδομάδα", "ασθενείς", "αυτή την εβδομάδα"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getWeekRange();
            return await Patient.find({
                operationDate: { $gte: start, $lte: end },
                deleted: { $ne: true }
            }).select('firstname lastname operationDate legOperation').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα");
            if (data.length === 0) return "Δεν υπάρχουν ασθενείς με επέμβαση αυτή την εβδομάδα.";
            if (wantsCount) return `Υπάρχουν ${data.length} ασθενείς με επέμβαση αυτή την εβδομάδα.`;
            return `Ασθενείς με επέμβαση αυτή την εβδομάδα (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Επέμβαση: ${formatDate(p.operationDate)})`).join('\n\n');
        }
    },

    {
        id: "patients-added-month",
        description: "Ασθενείς που προστέθηκαν αυτόν τον μήνα",
        keywords: ["νέοι ασθενείς", "προστέθηκαν", "εγγράφηκαν", "μήνα", "αυτόν τον μήνα"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getMonthRange();
            return await Patient.find({
                createdAt: { $gte: start, $lte: end },
                deleted: { $ne: true }
            }).select('firstname lastname createdAt').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσοι") || question.includes("ποσα");
            if (data.length === 0) return "Δεν προστέθηκαν νέοι ασθενείς αυτόν τον μήνα.";
            if (wantsCount) return `Προστέθηκαν ${data.length} νέοι ασθενείς αυτόν τον μήνα.`;
            return `Νέοι ασθενείς αυτόν τον μήνα (${data.length}):\n\n` +
                data.map(p => `• ${patientName(p)} (Εγγραφή: ${formatDate(p.createdAt)})`).join('\n\n');
        }
    },

    // Appointment Queries
    {
        id: "appointments-today",
        description: "Ραντεβού σήμερα",
        keywords: ["ραντεβού", "σήμερα"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getTodayRange();
            return await Appointment.find({
                datetime: { $gte: start, $lte: end }
            }).populate('patient', 'firstname lastname').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσα") || question.includes("ποσοι");
            if (data.length === 0) return "Δεν υπάρχουν ραντεβού για σήμερα.";
            if (wantsCount) return `Υπάρχουν ${data.length} ραντεβού σήμερα.`;
            return `Ραντεβού σήμερα (${data.length}):\n\n` +
                data.map(a => {
                    const time = new Date(a.datetime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
                    const name = a.patient ? patientName(a.patient) : 'Άγνωστος ασθενής';
                    return `• ${time} (${name})`;
                }).join('\n\n');
        }
    },

    {
        id: "appointments-week",
        description: "Ραντεβού αυτή την εβδομάδα",
        keywords: ["ραντεβού", "εβδομάδα", "αυτή την εβδομάδα"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getWeekRange();
            return await Appointment.find({
                datetime: { $gte: start, $lte: end }
            }).populate('patient', 'firstname lastname').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσα") || question.includes("ποσοι");
            if (data.length === 0) return "Δεν υπάρχουν ραντεβού αυτή την εβδομάδα.";
            if (wantsCount) return `Υπάρχουν ${data.length} ραντεβού αυτή την εβδομάδα.`;
            return `Ραντεβού αυτή την εβδομάδα (${data.length}):\n\n` +
                data.map(a => {
                    const date = formatDate(a.datetime);
                    const time = new Date(a.datetime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
                    const name = a.patient ? patientName(a.patient) : 'Άγνωστος ασθενής';
                    return `• ${date} ${time} (${name})`;
                }).join('\n\n');
        }
    },

    {
        id: "appointments-month",
        description: "Ραντεβού αυτόν τον μήνα",
        keywords: ["ραντεβού", "μήνα", "αυτόν τον μήνα"],
        minScore: 2,
        execute: async () => {
            const { start, end } = getMonthRange();
            return await Appointment.find({
                datetime: { $gte: start, $lte: end }
            }).populate('patient', 'firstname lastname').lean();
        },
        formatResponse: (data, question) => {
            const wantsCount = question.includes("ποσα") || question.includes("ποσοι");
            if (data.length === 0) return "Δεν υπάρχουν ραντεβού αυτόν τον μήνα.";
            if (wantsCount) return `Υπάρχουν ${data.length} ραντεβού αυτόν τον μήνα.`;
            return `Ραντεβού αυτόν τον μήνα (${data.length}):\n\n` +
                data.map(a => {
                    const date = formatDate(a.datetime);
                    const name = a.patient ? patientName(a.patient) : 'Άγνωστος ασθενής';
                    return `• ${date} (${name})`;
                }).join('\n\n');
        }
    },
];

// Match question to template and execute or give fallback message
export async function matchAndExecuteQuery(question: string): Promise<QueryResult> {

    // Preprocess once — strip accents + expand synonyms
    const processed = preprocessQuestion(question);

    // Score every template against the preprocessed question using prefix-aware matching
    const scored = queryTemplates.map((template) => ({
        template,
        score: scoreKeywords(template.keywords, processed),
    }));

    // Sort by score descending — best match first
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // Primary threshold is template's own minScore but if exactly ONE template scored > 0, use it
    const singleMatch = scored.filter((s) => s.score > 0).length === 1;
    const meetsThreshold = best && best.score >= best.template.minScore;
    const useFallbackMatch = best && best.score > 0 && singleMatch;

    if (!meetsThreshold && !useFallbackMatch) {
        return {
            found: false,
            templateId: "none",
            response: buildFallbackMessage(),
        };
    }

    // Run the matched template's Mongoose query
    const data = await best.template.execute();

    // Format and return the response so that formatResponse count checks works
    return {
        found: true,
        templateId: best.template.id,
        response: best.template.formatResponse(data, processed),
    };
}

function buildFallbackMessage(): string {
    const available = queryTemplates.map((t) => `- ${t.description}`).join('\n');
    return `Δεν κατάλαβα την ερώτησή σας.\n\nΜπορώ να απαντήσω σε ερωτήσεις όπως:\n\n${available}`;
}
