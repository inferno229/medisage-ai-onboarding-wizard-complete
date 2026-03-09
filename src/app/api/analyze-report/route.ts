import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileName, fileType, profile } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are MediSage AI Medical Report Analyzer.
    Analyze a medical report named "${fileName}" (${fileType}) for a user with the following profile:
    - Age group: ${profile?.ageGroup || 'Not provided'}
    - Gender: ${profile?.gender || 'Not provided'}
    - Goals: ${profile?.goals?.join(', ') || 'Not provided'}
    - Current problems: ${profile?.currentProblems?.join(', ') || 'None reported'}
    - Medical history: ${profile?.medicalHistory?.join(', ') || 'None reported'}
    
    Since you don't have the actual file content (this is a simulation of file analysis based on the name for now, or imagine the user provided text from it), provide a generic but highly professional breakdown as if you had analyzed it.
    
    Return ONLY a valid JSON object with no markdown formatting, with:
    {
      "summary": "One sentence summary of the report status",
      "findings": [
        { "label": "Finding 1", "status": "normal/warning/critical", "value": "value if applicable" },
        { "label": "Finding 2", "status": "normal/warning/critical", "value": "value if applicable" }
      ],
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "actions": [
        { "label": "Schedule Doctor Visit" },
        { "label": "Review Findings" }
      ]
    }`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    // Extract JSON from response, handling markdown code blocks
    let jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    let jsonData = null;
    
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from markdown block:", e);
      }
    }
    
    // If no markdown block, try direct JSON
    if (!jsonData) {
      jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }
    }

    if (!jsonData) {
      console.error("Failed to extract JSON from AI response:", text);
      throw new Error("Invalid AI response format");
    }

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Report Analysis Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to analyze report",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
