/**
* KnowledgeBase.ts
* @title Knowledge Base Data
* @description Sample FAQ documents to populate the KnowledgeBase collection
* @file src\app\chatbot\models\KnowledgeBase.ts
*
* @version 1.0
* @date 08/05/2026
*
* @author: Evangelia Andredaki [csd4588]
**/

import mongoose, { Schema, Document } from "mongoose";

export interface KnowledgeDocument extends Document {
    topic: string;
    category: "app-usage" | "medical" | "administrative";
    keywords: string[];
    content: string;
    source?: string;
}

const KnowledgeBaseSchema = new Schema<KnowledgeDocument>({
    topic: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["app-usage", "medical", "administrative"],
        required: true,
    },
    keywords: {
        type: [String],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: false,
    },
});

export default mongoose.models.KnowledgeBase || mongoose.model<KnowledgeDocument>("KnowledgeBase", KnowledgeBaseSchema);
