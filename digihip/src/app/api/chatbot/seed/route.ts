/**
* route.ts
* @title Knowledge Base Seed Route
* @description API route to seed the KnowledgeBase collection
* @file src\app\api\chatbot\seed\route.ts
*
* @version 1.0
* @date 08/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

import { NextResponse } from "next/server";
import { seedKnowledgeBase } from "@/chatbot/data/knowledgeBaseSeed";

export async function POST() {
    try {
        await seedKnowledgeBase();
        return NextResponse.json(
            { message: "KnowledgeBase seeded successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed KnowledgeBase.", error: String(error) },
            { status: 500 }
        );
    }
}
