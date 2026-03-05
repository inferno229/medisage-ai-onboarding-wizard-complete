import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryKnowledgeBase } from "@/lib/rag";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { message, profile, recentLogs } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Emergency Override
    const lowerMsg = message.toLowerCase();
    const emergencyTriggers = ["chest pain", "can't breathe", "suicidal", "stroke", "cant breathe"];
    if (emergencyTriggers.some(trigger => lowerMsg.includes(trigger))) {
      return NextResponse.json({
        role: "ai",
        content: "This sounds like a life-threatening emergency. Please call 112 immediately or go to the nearest emergency room. I am an AI, not a doctor.",
        type: "emergency"
      });
    }

    // RAG Query
    const kbContext = queryKnowledgeBase(message);
    const kbText = kbContext.length > 0 
      ? `\n\nRelated Medical Knowledge from our curated base:\n${kbContext.map((item: any) => `### ${item.title}\n${item.content}`).join('\n\n')}`
      : "";

    const systemPrompt = `You are MediSage AI.
You already know this user:
- Age group: ${profile?.ageGroup || 'Not provided'}
- Goals: ${profile?.goals?.join(', ') || 'Not provided'}
- Current problems: ${profile?.currentProblems?.join(', ') || 'None reported'}
- Medical history: ${profile?.medicalHistory?.join(', ') || 'None reported'}
- Family history: ${profile?.familyHistory?.join(', ') || 'None reported'}
- Risk flags: ${profile?.riskFlags?.join(', ') || 'None'}
- Activity level: ${profile?.activityLevel || 'Not provided'}
- Sleep pattern: ${profile?.sleepPattern || 'Not provided'}
- Ayurveda enabled: ${profile?.ayurvedaEnabled ?? true}
- Yoga enabled: ${profile?.yogaEnabled ?? true}
Recent logs (last 7 days): ${JSON.stringify(recentLogs || [])}${kbText}

Always use this profile and medical knowledge to give personalized, medically accurate answers.
Never ask for information you already know about the user.
If user asks about their health, refer to their known conditions and history automatically.

Return your response in a clear, structured format like this:
Possible condition: [Condition Name]
Causes: [Cause 1, Cause 2, ...]
Symptoms: [Symptom 1, Symptom 2, ...]
What to do: [Action 1, Action 2, ...]
Yoga tip: [Specific Yoga Tip]
Ayurvedic tip: [Specific Ayurvedic Tip]
When to see doctor: [Specific Red Flags]
Source: [Medical Source]

If the question is not medical, you can respond normally but keep it professional.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am MediSage AI, and I will provide personalized, structured medical guidance based on the user's profile, logs, and medical knowledge base." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // Basic parsing for structured response if it matches the pattern
    const isStructured = responseText.includes("Possible condition:");
    
    if (isStructured) {
        const sections: any = {};
        const lines = responseText.split('\n');
        let currentKey = '';
        
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, ...value] = line.split(':');
                currentKey = key.trim();
                sections[currentKey] = value.join(':').trim();
            } else if (currentKey && line.trim()) {
                sections[currentKey] += ' ' + line.trim();
            }
        });

        return NextResponse.json({
            role: "ai",
            content: "I've analyzed your situation based on your profile and health data.",
            type: "medical",
            data: {
                condition: sections["Possible condition"] || sections["Condition"] || "General Health Query",
                causes: sections["Causes"]?.split(',').map((s: string) => s.trim()) || [],
                symptoms: sections["Symptoms"]?.split(',').map((s: string) => s.trim()) || [],
                todo: sections["What to do"]?.split(',').map((s: string) => s.trim()) || [],
                yoga: sections["Yoga tip"] || sections["Yoga Tip"] || "Stay active with light stretching.",
                ayurveda: sections["Ayurvedic tip"] || sections["Ayurvedic Tip"] || "Drink warm water.",
                redFlags: sections["When to see doctor"] || sections["Red Flags"] || "If symptoms persist or worsen.",
                source: sections["Source"] || (kbContext.length > 0 ? kbContext[0].source : "MediSage AI Knowledge Base")
            }
        });
    }

    return NextResponse.json({
      role: "ai",
      content: responseText
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
