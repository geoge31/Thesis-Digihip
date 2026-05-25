/**
* patientQueryHandler.ts
* @title Patient Query Handler
* @description Handles questions about a specific patient.
* @file src\app\chatbot\core\patientQueryHandler.ts
*
* @version 1.9
* @date 21/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import { preprocessQuestion } from "./normalize";
import mongoose from "mongoose";

const DailyReportSchema = new mongoose.Schema({
    amka:          String,
    injectionDone: Boolean,
    exercisesDone: Boolean,
    painLevel:     Number,
    painCategory:  String,
    date:          { type: Date, default: Date.now },
});
const DailyReport =
    (mongoose.models.DailyReport as mongoose.Model<mongoose.Document>) ||
    mongoose.model("DailyReport", DailyReportSchema, "daily_reports");

const QuestionnaireSchema = new mongoose.Schema({
    amka:              String,
    mobility:          Number,
    selfCare:          Number,
    usualActivities:   Number,
    pain:              Number,
    anxiety:           Number,
    submittedAt:       { type: Date, default: Date.now },
});

const Questionnaire =
    (mongoose.models.Questionnaire as mongoose.Model<mongoose.Document>) ||
    mongoose.model("Questionnaire", QuestionnaireSchema, "questionnaires");

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
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function detectPeriod(question: string): "today" | "week" | "month" | "recent" {
    const p = preprocessQuestion(question);
    if (/σημερ/.test(p))                        return "today";
    if (/εβδομαδ/.test(p))                      return "week";
    if (/μην[αη]/.test(p))                      return "month";
    return "recent";
}

export interface PatientQueryResult {
    found: boolean;
    response: string;
    type?: "daily_reports" | "questionnaires" | "appointments";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any[];
    patientName?: string;
    periodLabel?: string;
}

// Detect what aspect of the patient the doctor is asking about
function detectTopic(question: string): "surgery" | "appointment" | "stage" | "preop" | "daily_reports" | "questionnaires" | "general" {
    const p = preprocessQuestion(question);

    if (/ερωτηματολογ|κινητικοτητ|αυτοεξυπηρετ|συνηθει[σς] δραστ|αγχ[οω]|καταθλιψ|αυτονομ/.test(p)) return "questionnaires";
    if (/πον[οω]|ασκησ|ενεσ|αγωγ|θεραπε|ημερησ|καθημερ/.test(p)) return "daily_reports";
    if (/επεμβ|εγχειρ|χειρουργ/.test(p))                   return "surgery";
    if (/ραντεβ/.test(p))                                   return "appointment";
    if (/προεγχειρ/.test(p))                               return "preop";
    if (/μετεγχειρ|σταδιο/.test(p))                        return "stage";

    return "general";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildPatientResponse(patient: any, topic: string, question: string): Promise<string> {
    const fullName = `${patient.firstname} ${patient.lastname}`;

    switch (topic) {
        case "surgery": {
            if (patient.operationDate) {
                const d = new Date(patient.operationDate);
                const now = new Date();
                if (d < now) {
                    return `Ο/Η ${fullName} έχει ήδη κάνει επέμβαση στις ${d.toLocaleDateString("el-GR")}.`;
                } else {
                    return `Ο/Η ${fullName} έχει προγραμματισμένη επέμβαση στις ${d.toLocaleDateString("el-GR")}.`;
                }
            }
            return `Δεν υπάρχει καταχωρημένη ημερομηνία επέμβασης για τον/την ${fullName}.`;
        }

        case "appointment": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const appointments: any[] = await Appointment.find({ patient: patient._id })
                .sort({ datetime: 1 })
                .lean();

            if (appointments.length === 0) {
                return `Δεν βρέθηκαν ραντεβού για τον/την ${fullName}.`;
            }

            const now = new Date();
            return {
                __structured: true,
                type: "appointments",
                patientName: fullName,
                periodLabel: "",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: appointments.map((a: any) => ({
                    datetime: new Date(a.datetime).toLocaleString("el-GR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                    }),
                    reason:   a.reason ?? null,
                    upcoming: new Date(a.datetime) >= now,
                })),
            } as unknown as string;
        }

        case "preop": {
            const stage = patient.isPreoperation
                ? "βρίσκεται στο προεγχειρητικό στάδιο"
                : "δεν βρίσκεται στο προεγχειρητικό στάδιο";
            return `Ο/Η ${fullName} ${stage}.`;
        }

        case "stage": {
            const stage = patient.currentStage ?? (patient.isPreoperation ? "Προεγχειρητικό" : "Μετεγχειρητικό");
            return `Ο/Η ${fullName} βρίσκεται στο στάδιο: ${stage}.`;
        }

        case "daily_reports": {
            const period = detectPeriod(question);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let reports: any[];

            if (period === "recent") {
                reports = await DailyReport.find({ amka: patient.amka })
                    .sort({ date: -1 }).limit(7).lean();
            } else {
                const dateField = "date";
                const range = period === "today" ? getTodayRange()
                            : period === "week"  ? getWeekRange()
                            : getMonthRange();
                reports = await DailyReport.find({
                    amka: patient.amka,
                    [dateField]: { $gte: range.start, $lte: range.end },
                }).sort({ date: -1 }).lean();
            }

            if (reports.length === 0) {
                const periodLabel = period === "today" ? "Σήμερα"
                                  : period === "week"  ? "Αυτήν την εβδομάδα"
                                  : period === "month" ? "Αυτόν τον μήνα"
                                  : "Πρόσφατα";
                return `Δεν βρέθηκαν ημερήσιες αναφορές για τον/την ${fullName} ${periodLabel}.`;
            }

            const periodLabel = period === "today" ? "Σήμερα"
                              : period === "week"  ? "Αυτήν την εβδομάδα"
                              : period === "month" ? "Αυτόν τον μήνα"
                              : "Πρόσφατες εγγραφές";

            const lines: string[] = [];
            void lines;
            return {
                __structured: true,
                type: "daily_reports",
                patientName: fullName,
                periodLabel,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: reports.map((r: any) => ({
                    date:          new Date(r.date).toLocaleDateString("el-GR"),
                    exercisesDone: r.exercisesDone ?? false,
                    injectionDone: r.injectionDone ?? false,
                    painLevel:     r.painLevel     ?? null,
                    painCategory:  r.painCategory  ?? null,
                })),
            } as unknown as string;
        }

        case "questionnaires": {
            const period = detectPeriod(question);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let questionnaires: any[];

            if (period === "recent") {
                questionnaires = await Questionnaire.find({ amka: patient.amka })
                    .sort({ submittedAt: -1 }).limit(5).lean();
            } else {
                const range = period === "today" ? getTodayRange()
                            : period === "week"  ? getWeekRange()
                            : getMonthRange();
                questionnaires = await Questionnaire.find({
                    amka: patient.amka,
                    submittedAt: { $gte: range.start, $lte: range.end },
                }).sort({ submittedAt: -1 }).lean();
            }

            if (questionnaires.length === 0) {
                const periodLabel = period === "today" ? "Σήμερα"
                                  : period === "week"  ? "Αυτήν την εβδομάδα"
                                  : period === "month" ? "Αυτόν τον μήνα"
                                  : "Πρόσφατα";
                return `Δεν βρέθηκαν ερωτηματολόγια για τον/την ${fullName} ${periodLabel}.`;
            }

            const periodLabel = period === "today" ? "Σήμερα"
                              : period === "week"  ? "Αυτήν την εβδομάδα"
                              : period === "month" ? "Αυτόν τον μήνα"
                              : "Πρόσφατες εγγραφές";

            return {
                __structured: true,
                type: "questionnaires",
                patientName: fullName,
                periodLabel,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: questionnaires.map((q: any) => ({
                    date:            new Date(q.submittedAt).toLocaleDateString("el-GR"),
                    mobility:        q.mobility        ?? null,
                    selfCare:        q.selfCare        ?? null,
                    usualActivities: q.usualActivities ?? null,
                    pain:            q.pain            ?? null,
                    anxiety:         q.anxiety         ?? null,
                })),
            } as unknown as string;
        }

        default: {
            // General summary
            const stage = patient.currentStage ?? (patient.isPreoperation ? "Προεγχειρητικό" : "Μετεγχειρητικό");
            const amka = patient.amka;
            const opDate = patient.operationDate
                ? `Ημ. επέμβασης: ${new Date(patient.operationDate).toLocaleDateString("el-GR")}.`
                : "Δεν υπάρχει καταχωρημένη ημερομηνία επέμβασης.";
            return `Ασθενής: ${fullName} (ΑΜΚΑ: ${amka})\nΣτάδιο: ${stage}\n${opDate}`;
        }
    }
}

export async function handlePatientQuery(
    firstname: string,
    lastname: string,
    question: string
): Promise<PatientQueryResult> {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patient: any = await Patient.findOne({
        firstname: { $regex: `^${firstname}$`, $options: "i" },
        lastname:  { $regex: `^${lastname}$`,  $options: "i" },
    })
        .select("firstname lastname amka operationDate isPreoperation currentStage")
        .lean();

    if (!patient) {
        return {
            found: false,
            response: `Δεν βρέθηκε ασθενής με όνομα ${firstname} ${lastname}.`,
        };
    }

    const topic = detectTopic(question);
    const raw = await buildPatientResponse(patient, topic, question);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structured = raw as any;
    if (structured?.__structured) {
        return {
            found:       true,
            response:    "",
            type:        structured.type,
            data:        structured.data,
            patientName: structured.patientName,
            periodLabel: structured.periodLabel,
        };
    }

    return { found: true, response: raw };
}

