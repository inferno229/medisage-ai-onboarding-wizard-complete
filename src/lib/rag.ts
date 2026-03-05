import fs from 'fs';
import path from 'path';

export function queryKnowledgeBase(query: string) {
  try {
    const KB_FILE = path.join(process.cwd(), 'knowledge-base/knowledge.json');
    if (!fs.existsSync(KB_FILE)) return [];
    
    const kb = JSON.parse(fs.readFileSync(KB_FILE, 'utf8'));
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 3);
    
    // Improved matching with scoring
    const scoredKb = kb.map((item: any) => {
      let score = 0;
      const title = item.title.toLowerCase();
      const content = item.content.toLowerCase();
      
      // Exact match in title
      if (title.includes(lowerQuery)) score += 10;
      // Word matches in title
      queryWords.forEach(word => {
        if (title.includes(word)) score += 5;
      });
      
      // Word matches in content
      queryWords.forEach(word => {
        if (content.includes(word)) score += 2;
      });
      
      return { ...item, score };
    });
    
    // Filter and sort by score
    return scoredKb
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5); // Return top 5 matches as requested
  } catch (err) {
    console.error("RAG Query Error:", err);
    return [];
  }
}
