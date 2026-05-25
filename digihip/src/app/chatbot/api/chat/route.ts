/**
* route.ts
* @title Chat API Route
* @description Handles chat-related API requests
* @file src\app\chatbot\api\chat\route.ts
*
* @version 1.4
* @date 21/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import chatbotConfig from "@/chatbot/config";
import { classifyIntent } from "@/chatbot/core/intentClassifier";
import { matchAndExecuteQuery } from "@/chatbot/core/queryTemplates";
import { retrieveFromKnowledge } from "@/chatbot/core/ragRetriever";
import { detectAmbiguity } from "@/chatbot/core/ambiguityDetector";
import { handlePatientQuery } from "@/chatbot/core/patientQueryHandler";
import {
    formatOffTopicResponse,
    formatAmbiguousResponse,
    formatQueryResponse,
    formatRagResponse,
    formatNotFoundResponse,
    formatErrorResponse,
} from "@/chatbot/core/responseFormatter";
import ChatCache from "@/chatbot/models/ChatCache";
import { preprocessQuestion } from "@/chatbot/core/normalize";
import crypto from "crypto";

// Hash a question string into a short unique key used to look it up in the cache
function hashQuestion(question: string): string {
    return crypto
        .createHash("md5")
        .update(preprocessQuestion(question))
        .digest("hex");
}
 
// [POST /api/chatbot/chat]
// Receives the doctor's question and returns a formatted response
export async function POST(request: Request) {

    // AUTH CHECK (Only logged-in doctors can use the chatbot)
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decodedToken) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    // PARSE AND VALIDATE QUESTION
    let question: string;
    let selectedPatient: { firstname: string; lastname: string } | null = null;
    try {
        const body = await request.json();
        question = body.question?.trim() ?? "";
        // The UI patient picker sends this when a patient is selected
        if (body.selectedPatient?.firstname && body.selectedPatient?.lastname) {
            selectedPatient = {
                firstname: body.selectedPatient.firstname,
                lastname:  body.selectedPatient.lastname,
            };
        }
    } catch {
        return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    if (question.length < chatbotConfig.minQuestionLength) {
        return NextResponse.json(
            formatNotFoundResponse("ambiguous"),
            { status: 200 }
        );
    }
    if (question.length > chatbotConfig.maxQuestionLength) {
        return NextResponse.json(
            { intent: "unknown", response: "Η ερώτησή σας είναι πολύ μεγάλη. Παρακαλώ συντομεύστε την." },
            { status: 200 }
        );
    }

    try {

        await dbConnect();

        // CHECK CACHE
        const questionHash = hashQuestion(question);
        const cached = await ChatCache.findOne({ questionHash });

        if (cached) {
            // Update hit count and last used date
            await ChatCache.updateOne(
                { questionHash },
                { $inc: { hitCount: 1 }, $set: { lastUsed: new Date() } }
            );
            // Return the cached response directly
            return NextResponse.json(
                { intent: cached.queryType, response: cached.cachedResult },
                { status: 200 }
            );
        }

        // CLASSIFY INTENT
        const intent = classifyIntent(question);

        // ROUTE TO THE RIGHT HANDLER
        let result;

        // If the UI patient picker provided a patient, skip intent classification
        if (selectedPatient) {
            const patientResult = await handlePatientQuery(
                selectedPatient.firstname,
                selectedPatient.lastname,
                question
            );
            if (!patientResult.found) {
                result = formatNotFoundResponse("text-to-query");
            } else if (patientResult.type) {
                return NextResponse.json({
                    intent:      "structured",
                    response:    "",
                    type:        patientResult.type,
                    data:        patientResult.data,
                    patientName: patientResult.patientName,
                    periodLabel: patientResult.periodLabel,
                }, { status: 200 });
            } else {
                result = formatQueryResponse(patientResult.response);
            }

        } else if (intent === "off-topic") {
            result = formatOffTopicResponse();

        } else if (intent === "ambiguous") {
            const ambiguity = detectAmbiguity(question);
            result = formatAmbiguousResponse(
                ambiguity.clarifyingQuestion,
                ambiguity.options
            );

        } else if (intent === "text-to-query") {
            const queryResult = await matchAndExecuteQuery(question);
            if (queryResult.found) {
                result = formatQueryResponse(queryResult.response);
            } else {
                const ragFallback = await retrieveFromKnowledge(question);
                result = ragFallback.found
                    ? formatRagResponse(ragFallback.response)
                    : formatNotFoundResponse("text-to-query");
            }

        } else {
            const ragResult = await retrieveFromKnowledge(question);
            if (ragResult.found) {
                result = formatRagResponse(ragResult.response);
            } else {
                const queryFallback = await matchAndExecuteQuery(question);
                result = queryFallback.found
                    ? formatQueryResponse(queryFallback.response)
                    : formatNotFoundResponse("rag");
            }
        }

        // SAVE TO CACHE
        if (result.intent === "rag") {
            await ChatCache.create({
                questionHash,
                originalQuestion: question,
                queryType: result.intent,
                cachedResult: result.response,
                hitCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            });
        }

        // RETURN RESPONSE
        return NextResponse.json(result, { status: 200 });

    } catch (error: unknown) {
        console.error("[Chatbot API Error]", error);
        return NextResponse.json(formatErrorResponse(), { status: 500 });
    }
}
