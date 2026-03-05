import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: Request) {
  try {
    const { content, mood } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const prompt = `The user is feeling "${mood}". They wrote this journal entry: "${content}". 
    Provide a supportive, therapeutic response or suggestion (1-2 sentences). 
    Keep it empathetic and positive.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ suggestion: text.trim() });

  } catch (error) {
    console.error("Journal Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze journal" }, { status: 500 });
  }
}
