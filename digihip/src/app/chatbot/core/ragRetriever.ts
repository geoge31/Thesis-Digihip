/**
* ragRetriever.ts
* @title RAG Retriever
* @description Searches the KnowledgeBase collection using normalized keyword matching
* @file src\app\chatbot\core\ragRetriever.ts
*
* @version 1.1
* @date 19/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import KnowledgeBase, { KnowledgeDocument } from "@/chatbot/models/KnowledgeBase";
import { preprocessQuestion, scoreKeywords } from "./normalize";

interface ScoredDocument {
    doc: KnowledgeDocument;
    score: number;
}

export interface RagResult {
    found: boolean;
    response: string;
}

// Counts how many of the document's keywords appear in the preprocessed question using accent-normalized, prefix-aware matching
function scoreDocument(preprocessedQuestion: string, doc: KnowledgeDocument): number {
    return scoreKeywords(doc.keywords, preprocessedQuestion);
}

// Format a single knowledge document into a readable response string
function formatDocument(doc: KnowledgeDocument): string {
    const source = doc.source ? `\n\nΠηγή: ${doc.source}` : '';
    return `${doc.topic}\n\n${doc.content}${source}`;
}

export async function retrieveFromKnowledge(question: string): Promise<RagResult> {

    // Load all documents from the KnowledgeBase collection
    const allDocs = await KnowledgeBase.find({}).lean() as KnowledgeDocument[];

    if (allDocs.length === 0) {
        return {
            found: false,
            response: "Δεν βρέθηκαν πληροφορίες στη βάση γνώσης.",
        };
    }

    // Preprocess once — strip accents + expand synonyms
    const processed = preprocessQuestion(question);

    // Score every document against the preprocessed question
    const scored: ScoredDocument[] = allDocs
        .map((doc) => ({
            doc,
            score: scoreDocument(processed, doc),
        }))
        // Keep only documents that matched at least one keyword
        .filter((item) => item.score > 0)
        // Sort by score descending — best match first
        .sort((a, b) => b.score - a.score);

    // No documents matched any keyword
    if (scored.length === 0) {
        return {
            found: false,
            response: "Δεν βρέθηκαν σχετικές πληροφορίες για την ερώτησή σας.",
        };
    }

    // Return the top result only
    const best = scored[0];
    return {
        found: true,
        response: formatDocument(best.doc),
    };
}

