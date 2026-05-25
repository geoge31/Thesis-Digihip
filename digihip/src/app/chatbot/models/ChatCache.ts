/**
* ChatCache.ts
* @title Chat Cache Data
* @description Sample chat cache documents to populate the ChatCache collection
* @file src\app\chatbot\models\ChatCache.ts
*
* @version 1.0
* @date 08/05/2026
*
* @author: Evangelia Andredaki [csd4588]
**/

import mongoose, { Schema, Document } from "mongoose";

export interface ChatCacheDocument extends Document {
    questionHash: string;
    originalQuestion: string;
    queryType: "text-to-query" | "rag" | "ambiguous";
    cachedResult: string;
    hitCount: number;
    lastUsed: Date;
    createdAt: Date;
}

const ChatCacheSchema = new Schema<ChatCacheDocument>({
    questionHash: {
        type: String,
        required: true,
        unique: true,
    },
    originalQuestion: {
        type: String,
        required: true,
    },
    queryType: {
        type: String,
        enum: ["text-to-query", "rag", "ambiguous"],
        required: true,
    },
    cachedResult: {
        type: String,
        required: true,
    },
    hitCount: {
        type: Number,
        default: 0,
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ChatCache || mongoose.model<ChatCacheDocument>("ChatCache", ChatCacheSchema);
