"use client";

import React, { useState, useEffect } from "react";
import { 
  Smile, 
  Frown, 
  Meh, 
  CloudRain, 
  Sun, 
  Send, 
  Sparkles, 
  History,
  Plus,
  Heart,
  Calendar,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { getISTDate } from "@/lib/dateUtils";

const moods = [
  { label: "Great", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50" },
  { label: "Good", icon: Smile, color: "text-green-500", bg: "bg-green-50" },
  { label: "Okay", icon: Meh, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Down", icon: CloudRain, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "Stressed", icon: Frown, color: "text-red-500", bg: "bg-red-50" },
];

export default function JournalPage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("Good");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Fetch journal error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setIsSaving(true);
    
    try {
      // 1. Get AI Suggestion
      const aiRes = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood: selectedMood })
      });
      const { suggestion } = await aiRes.json();
      setAiSuggestion(suggestion);

      // 2. Save to Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content,
          mood: selectedMood,
          ai_suggestion: suggestion,
          date: getISTDate()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEntries(prev => [data, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error("Save journal error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await supabase.from('journal_entries').delete().eq('id', id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Delete journal error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 selection:bg-pink-500/20 px-4 md:px-0">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Mindful Journal</h1>
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Emotional wellbeing & AI Therapy</p>
      </header>

      {/* New Entry Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/10 shadow-sm mb-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">How are you feeling?</label>
            <div className="flex flex-wrap gap-3">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={cn(
                    "flex items-center gap-2 py-3 px-5 rounded-2xl border-2 transition-all",
                    selectedMood === m.label 
                      ? "bg-white dark:bg-[#0F172A] border-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                      : "bg-[#F8FAFC] dark:bg-[#0F172A]/40 border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10"
                  )}
                >
                  <m.icon size={18} className={m.color} />
                  <span className="text-sm font-black text-[#0F172A] dark:text-white">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind today? Write freely..."
              className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]/40 border-2 border-[#F1F5F9] dark:border-white/5 rounded-[2rem] p-6 font-bold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all min-h-[180px] resize-none dark:text-white"
            />
            
            <button 
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="w-full py-5 bg-[#0F172A] dark:bg-[#0D9488] text-white rounded-[2rem] font-black shadow-xl shadow-[#0F172A]/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isSaving ? <Sparkles className="animate-spin" /> : <Plus />}
              {isSaving ? "Saving & Analyzing..." : "Save Daily Entry"}
            </button>
          </div>

          <AnimatePresence>
            {aiSuggestion && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-pink-50 dark:bg-pink-500/10 p-6 rounded-[2rem] border border-pink-100 dark:border-pink-500/20"
              >
                <div className="flex items-center gap-3 text-pink-500 mb-2">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Therapy Suggestion</span>
                </div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] italic leading-relaxed">
                  "{aiSuggestion}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight flex items-center gap-2 ml-2">
          <History size={20} className="text-[#0D9488]" />
          Past Entries
        </h2>

        {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D9488]"></div>
            </div>
        ) : entries.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] font-bold">No entries yet. Start writing!</div>
        ) : (
            <div className="space-y-4">
                {entries.map((entry) => (
                    <motion.div 
                        key={entry.id}
                        layout
                        className="bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm group hover:shadow-xl transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-2 rounded-xl">
                                    <Calendar size={16} className="text-[#94A3B8]" />
                                </div>
                                <span className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">{new Date(entry.created_at).toLocaleDateString()}</span>
                                <span className="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{entry.mood}</span>
                            </div>
                            <button onClick={() => deleteEntry(entry.id)} className="text-[#94A3B8] hover:text-[#FF5C5C] opacity-0 group-hover:opacity-100 transition-all p-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                        {entry.ai_suggestion && (
                            <div className="mt-4 pt-4 border-t border-[#F1F5F9] dark:border-white/5">
                                <div className="flex items-center gap-2 text-[#0D9488] mb-1">
                                    <Sparkles size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">AI Insight</span>
                                </div>
                                <p className="text-xs font-bold text-[#64748B] italic">{entry.ai_suggestion}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
