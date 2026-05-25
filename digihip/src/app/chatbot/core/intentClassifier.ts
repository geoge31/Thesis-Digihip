/**
* intentClassifier.ts
* @title Intent Classifier
* @description Classifies user questions into intents: text-to-query, RAG, ambiguous, or off-topic
* @file src\app\chatbot\core\intentClassifier.ts
*
* @version 1.9
* @date 21/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import { preprocessQuestion, scoreKeywords } from "./normalize";

export type Intent = "text-to-query" | "rag" | "ambiguous" | "off-topic";


// Words that indicate the doctor wants REAL DATA from the database
const textToQueryKeywords: string[] = [

    "πόσοι", "πόσες", "πόσα", "σύνολο", "αριθμός",
    "λίστα", "εμφάνισε", "δείξε", "βρες", "δείξε μου", "εμφάνισε μου",
    "εμφάνισε όλους", "δείξε όλους",
    "ασθενείς", "ασθενής", "ασθενή", "ασθενών",
    "ραντεβού",
    "επέμβαση", "χειρουργείο", "χειρουργηθούν",
    "προεγχειρητικό", "μετεγχειρητικό",
    "σήμερα", "αύριο", "αυτή την εβδομάδα", "αυτόν τον μήνα", "αυτό το μήνα",
    "πόνος", "επίπεδο πόνου", "επίπεδο πονου",
    "ασκήσεις", "ασκησεις", "άσκηση",
    "ένεση", "ενεση", "ινδανέτ", "ινδαντ",
    "ημερήσια", "καθημερινά", "καθημερινη",
    "αγωγή", "αγωγη", "θεραπεία", "θεραπεια",
    "ερωτηματολόγιο", "ερωτηματολογιο",
    "κινητικότητα", "κινητικοτητα",
    "άγχος", "αγχος",
    "αυτονομία", "αυτονομια",
    "συνήθεις δραστηριότητες", "συνηθεις δραστηριοτητες",

];

// Words that indicate the doctor wants a GENERAL EXPLANATION
const ragKeywords: string[] = [

    "τι είναι", "τι σημαίνει", "τι εννοείς",
    "πώς", "πως", "πώς λειτουργεί", "πώς γίνεται",
    "γιατί",
    "πότε",
    "τι πρέπει",
    "εξήγησε", "εξήγησέ μου", "εξήγηση", "πες μου", "περιέγραψε",
    "πληροφορίες", "πληροφορία", "θέλω να μάθω", "τι γνωρίζεις",
    "αρθροπλαστική", "αρθροπλαστικής", "ισχίο", "ισχίου",
    "προεγχειρητικό στάδιο", "μετεγχειρητικό στάδιο",
    "φυσικοθεραπεία", "αποκατάσταση", "ανάρρωση", "αποθεραπεία",
    "αντιπηκτικά", "επιπλοκές", "παρενέργειες", "κίνδυνοι",
    "θρόμβωση", "εξάρθρωση", "μόλυνση",
    "χρόνιες παθήσεις", "διαβήτης", "υπέρταση",
    "αρχεία", "κωδικός", "ειδοποιήσεις", "μηνύματα",
    "ιστορικό αλλαγών", "ιστορικό",
    "σύστημα", "εφαρμογή", "λειτουργία",
    "προσθήκη", "διαγραφή", "επαναφορά", "επεξεργασία",
    "ανέβασμα αρχείων", "ιατρικά αρχεία",

];

// Words that indicate the question is NOT related to the app
const offTopicKeywords: string[] = [
    "καιρός", "αθλητικά", "ποδόσφαιρο", "μουσική",
    "ταινία", "πολιτική", "οικονομία", "σεισμός",
    "weather", "sports", "football", "music", "movie",
    "μαγειρική", "συνταγή", "ειδήσεις",
];

export function classifyIntent(question: string): Intent {
    // Preprocess: strip accents + expand synonyms
    const processed = preprocessQuestion(question);

    // Check for off-topic first
    if (scoreKeywords(offTopicKeywords, processed) > 0) {
        return "off-topic";
    }

    const queryScore = scoreKeywords(textToQueryKeywords, processed);
    const ragScore   = scoreKeywords(ragKeywords, processed);

    // If both scores are equal and greater than 0 then ambiguous
    if (queryScore > 0 && ragScore > 0 && queryScore === ragScore) {
        return "ambiguous";
    }

    if (queryScore > ragScore) return "text-to-query";
    if (ragScore > queryScore) return "rag";

    // No keywords matched at all then ambiguous (bot will ask for clarification)
    return "ambiguous";
}

