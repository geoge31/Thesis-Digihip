/**
* normalize.ts
* @title Normalization & Matching Utilities
* @description Shared helpers for accent stripping, synonym expansion and prefix-aware keyword scoring.
* @file src\app\chatbot\core\normalize.ts
*
* @version 1.1
* @date 19/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

// ACCENT / DIACRITIC STRIPPING
export function stripAccents(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[;.,!?:«»"""''()\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// SYNONYM MAP
const synonymMap: Record<string, string[]> = {

    "χειρουργειο":       ["επεμβαση"],
    "χειρουργηθει":      ["επεμβαση"],
    "χειρουργηθουν":     ["επεμβαση"],
    "χειρουργηθηκε":     ["επεμβαση"],
    "εγχειριση":         ["επεμβαση"],
    "εγχειρηση":         ["επεμβαση"],
    "επεμβασης":         ["επεμβαση"],
    "επεμβασεων":        ["επεμβαση"],

    "ασθενη":            ["ασθενης", "ασθενεις"],
    "ασθενων":           ["ασθενης", "ασθενεις"],
    "ασθενους":          ["ασθενης"],
    "ασθενη μου":        ["ασθενεις"],
    "ασθενεις μου":      ["ασθενεις"],

    "ραντεβου":          ["ραντεβου"],
    "συναντηση":         ["ραντεβου"],
    "συναντησεις":       ["ραντεβου"],
    "προγραμμα":         ["ραντεβου"],

    "ασκηση":            ["φυσικοθεραπεια", "αποκατασταση"],
    "ασκησεις":          ["φυσικοθεραπεια", "αποκατασταση"],
    "θεραπεια":          ["αποκατασταση", "φυσικοθεραπεια"],
    "θεραπειας":         ["αποκατασταση", "φυσικοθεραπεια"],
    "αποθεραπεια":       ["φυσικοθεραπεια", "αποκατασταση"],
    "αποκαταστασης":     ["αποκατασταση"],
    "αποκατασταση":      ["φυσικοθεραπεια"],

    "ισχιου":            ["ισχιο", "αρθροπλαστικη"],
    "αρθροπλαστικης":    ["αρθροπλαστικη"],
    "αρθροπλαστικη":     ["αρθροπλαστικη"],
    "ολικη":             ["αρθροπλαστικη"],
    "protesi":           ["αρθροπλαστικη", "εμφυτευμα"],
    "προθεση":           ["αρθροπλαστικη", "εμφυτευμα"],

    "προεγχειρητικος":   ["προεγχειρητικο"],
    "προεγχειρητικη":    ["προεγχειρητικο"],
    "προεγχειρητικοι":   ["προεγχειρητικο", "προεγχειρητικοι"],
    "μετεγχειρητικος":   ["μετεγχειρητικο"],
    "μετεγχειρητικη":    ["μετεγχειρητικο"],
    "μετεγχειρητικοι":   ["μετεγχειρητικο", "μετεγχειρητικοι"],
    "μετα επεμβαση":     ["μετεγχειρητικο"],
    "πριν επεμβαση":     ["προεγχειρητικο"],
    "μετα χειρουργειο":  ["μετεγχειρητικο"],
    "πριν χειρουργειο":  ["προεγχειρητικο"],

    "σταδιο":            ["σταδιο"],
    "φαση":              ["σταδιο"],
    "φαση ανανρωσης":    ["μετεγχειρητικο"],

    "παρενεργειες":      ["επιπλοκες"],
    "κινδυνοι":          ["επιπλοκες"],
    "προβληματα":        ["επιπλοκες"],
    "φαρμακα":           ["αντιπηκτικα"],
    "αγωγη":             ["αντιπηκτικη αγωγη"],
    "θρομβωση":          ["θρομβωση"],

    "προσθεσω":          ["προσθηκη", "προσθετω"],
    "καταχωρηση":        ["προσθηκη"],
    "εγγραφη":           ["προσθηκη", "νεος ασθενης"],
    "επεξεργαστω":       ["επεξεργασια"],
    "αλλαξω":            ["αλλαγη", "επεξεργασια"],
    "τροποποιηση":       ["επεξεργασια"],
    "διαγραψω":          ["διαγραφη"],
    "σβησω":             ["διαγραφη"],
    "επαναφερω":         ["επαναφορα"],
    "ανακτησω":          ["επαναφορα"],

    "εγγραφα":           ["αρχεια"],
    "εγγραφο":           ["αρχεια"],
    "ανεβασω":           ["αναβασμα αρχειων"],
    "ανεβασμα":          ["αναβασμα αρχειων"],

    "κωδικο":            ["κωδικος"],
    "κωδικους":          ["κωδικος"],
    "παρολο":            ["κωδικος"],
    "password":          ["κωδικος"],

    "ειδοποιησεις":      ["ειδοποιησεις"],
    "υπενθυμιση":        ["ειδοποιησεις"],
    "υπενθυμισεις":      ["ειδοποιησεις"],
    "μηνυμα":            ["μηνυματα"],
    "μηνυματων":         ["μηνυματα"],
    "inbox":             ["μηνυματα", "εισερχομενα"],

    "ιστορικο":          ["ιστορικο αλλαγων"],
    "αλλαγες":           ["ιστορικο αλλαγων"],
    "καταγραφη":         ["ιστορικο αλλαγων"],

    "πες μου":           ["τι ειναι", "πληροφοριες"],
    "θελω να μαθω":      ["τι ειναι", "πληροφοριες"],
    "εξηγησε μου":       ["εξηγηση"],
    "τι γνωριζεις":      ["τι ειναι", "πληροφοριες"],
    "περισσοτερα":       ["πληροφοριες"],
    "βοηθεια":           ["πληροφοριες"],

    "δειξε μου τους ασθενεις": ["ασθενεις", "δειξε"],
    "δειξε μου τις ασθενεις":  ["ασθενεις", "δειξε"],
    "δειξε μου ολους":         ["ασθενεις", "δειξε"],
    "εμφανισε μου τους":       ["ασθενεις", "εμφανισε"],
    "ποιοι ασθενεις":          ["ασθενεις", "δειξε"],
    "ποιες ασθενεις":          ["ασθενεις", "δειξε"],
};


 // Expand a normalized question string by appending synonyms for any recognized word/phrase
export function expandSynonyms(normalizedQuestion: string): string {
    let expanded = normalizedQuestion;
    for (const [trigger, replacements] of Object.entries(synonymMap)) {
        if (normalizedQuestion.includes(trigger)) {
            expanded += " " + replacements.join(" ");
        }
    }
    return expanded;
}

// FULL QUESTION PREPROCESSING
export function preprocessQuestion(question: string): string {
    const normalized = stripAccents(question);
    return expandSynonyms(normalized);
}

// PREFIX-AWARE KEYWORD SCORING
const PREFIX_RATIO = 0.8;

function keywordMatchesQuestion(normalizedKeyword: string, preprocessedQuestion: string): boolean {
    // Exact substring match
    if (preprocessedQuestion.includes(normalizedKeyword)) return true;

    // Prefix match
    if (normalizedKeyword.length > 4) {
        const prefixLen = Math.floor(normalizedKeyword.length * PREFIX_RATIO);
        const prefix = normalizedKeyword.slice(0, prefixLen);
        const words = preprocessedQuestion.split(" ");
        for (const word of words) {
            if (word.length >= prefixLen && word.startsWith(prefix)) return true;
        }
    }

    return false;
}

// Score a list of keywords against a preprocessed question.
export function scoreKeywords(keywords: string[], preprocessedQuestion: string): number {
    return keywords.filter((kw) =>
        keywordMatchesQuestion(stripAccents(kw), preprocessedQuestion)
    ).length;
}
