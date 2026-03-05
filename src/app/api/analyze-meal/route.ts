import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: Request) {
  try {
    const { meal } = await req.json();

    if (!meal) {
      return NextResponse.json({ error: "Meal description is required" }, { status: 400 });
    }

    const prompt = `Analyze this meal: "${meal}". 
    Provide a health score out of 10 and evaluate it based on Protein, Vegetable Variety, and Complex Carbs.
    Return only a JSON object like this:
    {
      "score": 8,
      "protein": "High/Medium/Low",
      "vegetables": "High/Medium/Low",
      "carbs": "High/Medium/Low",
      "tip": "Short 1-sentence tip"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response (sometimes Gemini adds markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) {
        throw new Error("Failed to parse AI response");
    }

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Meal Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze meal" }, { status: 500 });
  }
}
