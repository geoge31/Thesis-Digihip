/**
* responseFormatter.ts
* @title Response Formatter
* @description Formats raw DB data or KnowledgeBase documents into friendly Greek responses
* @file src\app\chatbot\core\responseFormatter.ts
*
* @version 1.0
* @date 10/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import { Intent } from "@/chatbot/core/intentClassifier";

export interface FormattedResponse {
    intent: Intent | "off-topic" | "unknown";
    response: string;
    options?: string[];
}

// Returned when the question has nothing to do with the app
export function formatOffTopicResponse(): FormattedResponse {
    return {
        intent: "off-topic",
        response: "Μπορώ να απαντήσω μόνο σε ερωτήσεις σχετικές με την εφαρμογή διαχείρισης ασθενών. Παρακαλώ ρωτήστε κάτι σχετικό με ασθενείς, ραντεβού ή τη λειτουργία της εφαρμογής.",
    };
}

// Returned when the question is not clear enough,options are shown as clickable buttons in the UI
export function formatAmbiguousResponse(clarifyingQuestion: string, options: string[]): FormattedResponse {
    return {
        intent: "ambiguous",
        response: clarifyingQuestion,
        options: options.length > 0 ? options : undefined,
    };
}

// Returned when a query template was matched and the query was executed successfully
export function formatQueryResponse(response: string): FormattedResponse {
    return {
        intent: "text-to-query",
        response,
    };
}

// Returned when a KnowledgeBase document was found
export function formatRagResponse(response: string): FormattedResponse {
    return {
        intent: "rag",
        response,
    };
}

// Returned when intent was correct but no matching template or document was found
export function formatNotFoundResponse(intent: Intent): FormattedResponse {
    const message = intent === "text-to-query"
        ? "Δεν βρέθηκαν αποτελέσματα για την ερώτησή σας. Δοκιμάστε να ρωτήσετε διαφορετικά."
        : "Δεν βρέθηκαν σχετικές πληροφορίες για την ερώτησή σας. Δοκιμάστε να ρωτήσετε διαφορετικά.";

    return {
        intent,
        response: message,
    };
}

// Returned when something unexpected goes wrong
export function formatErrorResponse(): FormattedResponse {
    return {
        intent: "unknown",
        response: "Παρουσιάστηκε κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
    };
}