import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { fileName, fileType, profile } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const systemPrompt = `You are MediSage AI Medical Report Analyzer.
    Analyze a medical report named "${fileName}" (${fileType}) for a user with the following profile:
    - Age group: ${profile?.ageGroup || 'Not provided'}
    - Gender: ${profile?.gender || 'Not provided'}
    - Goals: ${profile?.goals?.join(', ') || 'Not provided'}
    - Current problems: ${profile?.currentProblems?.join(', ') || 'None reported'}
    - Medical history: ${profile?.medicalHistory?.join(', ') || 'None reported'}
    
    Since you don't have the actual file content (this is a simulation of file analysis based on the name for now, or imagine the user provided text from it), provide a generic but highly professional breakdown as if you had analyzed it.
    
    Return a JSON object with:
    {
      "summary": "One sentence summary of the report status",
      "findings": [
        { "label": "Finding 1", "status": "normal/warning/critical", "value": "value if applicable" },
        ...
      ],
      "insights": ["Insight 1", "Insight 2"],
      "actions": [
        { "label": "Action 1", "icon": "reminder/doctor/activity" }
      ]
    }`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) {
        throw new Error("Failed to parse AI response");
    }

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Report Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze report" }, { status: 500 });
  }
}
