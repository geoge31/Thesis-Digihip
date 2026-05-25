/**
* ambiguityDetector.ts
* @title Ambiguity Detector
* @description Checks if a question has multiple possible interpretations
* @file src\app\chatbot\core\ambiguityDetector.ts
*
* @version 1.2
* @date 19/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import { preprocessQuestion } from "./normalize";

export interface AmbiguityResult {
    isAmbiguous: boolean;
    clarifyingQuestion: string;
    options: string[];
}

// Each entry maps a trigger word/phrase to a list of possible interpretations the doctor might have meant
const ambiguousTerms: Record<string, string[]> = {

    "αλλαγή": [
        "Αλλαγή στοιχείων ασθενή",
        "Αλλαγή κωδικού πρόσβασης",
        "Αλλαγή ραντεβού",
    ],

    "διαγραφή": [
        "Διαγραφή ασθενή",
        "Διαγραφή ραντεβού",
    ],

    "επαναφορά": [
        "Επαναφορά κωδικού πρόσβασης",
        "Επαναφορά διαγραμμένου ασθενή",
    ],

    "στοιχεία": [
        "Στοιχεία ασθενή",
        "Στοιχεία ραντεβού",
        "Στοιχεία λογαριασμού",
    ],

    "ιστορικό": [
        "Ιστορικό αλλαγών ασθενή",
        "Ιατρικό ιστορικό ασθενή",
    ],

    "πληροφορίες": [
        "Πληροφορίες για ασθενή",
        "Πληροφορίες για ραντεβού",
        "Πληροφορίες για την εφαρμογή",
    ],

    "προεγχειρητικό": [
        "Λίστα προεγχειρητικών ασθενών",
        "Τι είναι το προεγχειρητικό στάδιο",
    ],

    "μετεγχειρητικό": [
        "Λίστα μετεγχειρητικών ασθενών",
        "Τι είναι το μετεγχειρητικό στάδιο",
    ],
};

// Checks if the question contains any ambiguous term and returns clarification options
export function detectAmbiguity(question: string): AmbiguityResult {
    // Normalize the incoming question so accent-less input still matches
    const q = preprocessQuestion(question);

    // Check each ambiguous term against the question
    for (const [term, options] of Object.entries(ambiguousTerms)) {
        // Normalize the term too so the comparison is always accent-insensitive
        if (q.includes(preprocessQuestion(term))) {
            return {
                isAmbiguous: true,
                // Ask the doctor to pick one of the options
                clarifyingQuestion: `Τι εννοείτε με "${term}"; Παρακαλώ επιλέξτε μία από τις παρακάτω επιλογές:`,
                options,
            };
        }
    }

    // No ambiguous term found
    return {
        isAmbiguous: false,
        clarifyingQuestion: "Δεν κατάλαβα την ερώτησή σας. Μπορείτε να την διατυπώσετε διαφορετικά;",
        options: [],
    };
}