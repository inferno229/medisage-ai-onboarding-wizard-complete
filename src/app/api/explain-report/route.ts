import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

export async function POST(req: Request) {
  try {
    const { fileName, fileContent } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    let prompt = `Analyze this medical report named "${fileName}". `;
    if (fileContent) {
        prompt += `Content snippet: "${fileContent}". `;
    }
    
    prompt += `Provide a clear breakdown of findings, actionable insights, and health advice. 
    Return only a JSON object like this:
    {
      "findings": ["Finding 1", "Finding 2"],
      "insights": ["Insight 1", "Insight 2"],
      "advice": ["Advice 1", "Advice 2"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) {
        throw new Error("Failed to parse AI response");
    }

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Report Explanation Error:", error);
    return NextResponse.json({ error: "Failed to explain report" }, { status: 500 });
  }
}
