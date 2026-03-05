"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { 
  Send, 
  Mic, 
  Camera, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  Stethoscope, 
  Brain, 
  Leaf, 
  Wind,
  Bell,
  Check,
  ChevronRight,
  User,
  ShieldAlert,
  Info,
  Droplets,
  Moon,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { supabase } from "@/lib/supabaseClient";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  type?: "medical" | "emergency" | "routine";
  data?: any;
};

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query");
  const { user } = useAuth();
  const { stats } = useHealth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadProfileAndLogs = async () => {
      if (!user) return;
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile({
          ageGroup: profileData.age_group,
          gender: profileData.gender,
          goals: profileData.goals,
          currentProblems: profileData.current_problems,
          medicalHistory: profileData.conditions,
          familyHistory: profileData.family_history,
          ayurvedaEnabled: profileData.ayurveda_enabled,
          yogaEnabled: profileData.yoga_enabled,
          activityLevel: profileData.work_type,
          sleepPattern: profileData.bedtime
        });
      }

      // Fetch logs for last 7 days
      const { data: logsData } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);
      
      setRecentLogs(logsData || []);
    };

    loadProfileAndLogs();
  }, [user]);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [initialQuery, profile]); // Wait for profile to be ready if possible

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          profile,
          recentLogs
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.content,
        type: data.type,
        data: data.data
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Save to chat history
      if (user) {
        await supabase.from('chat_history').insert({
          user_id: user.id,
          message: text,
          response: data.content,
          source_badges: data.data?.source ? [data.data.source] : []
        });
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm having trouble connecting to my knowledge base. Please check your internet and try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderAICard = (msg: Message) => {
    if (msg.type === "emergency") {
      return (
        <div className="w-full bg-[#FF5C5C] text-white p-6 rounded-3xl shadow-xl shadow-[#FF5C5C]/20 border-2 border-white/20 animate-pulse">
          <div className="flex items-center gap-4 mb-3">
            <ShieldAlert size={32} />
            <h3 className="text-xl font-black uppercase tracking-tight">Emergency Alert</h3>
          </div>
          <p className="font-bold text-lg leading-tight">{msg.content}</p>
          <a href="tel:112" className="mt-6 w-full py-4 bg-white text-[#FF5C5C] font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center">
            CALL 112 NOW
          </a>
        </div>
      );
    }

    if (msg.type === "medical" && msg.data) {
      const d = msg.data;
      return (
        <div className="w-full bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#0F172A]/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488]">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-xl font-black text-[#0F172A] dark:text-white">{d.condition}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={12} /> Analysis
              </span>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">{d.condition}</p>
              
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mt-4">
                <Info size={12} /> Potential Causes
              </span>
              <ul className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] space-y-1">
                {d.causes.map((c: string, i: number) => <li key={i}>• {c}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> Symptoms
              </span>
              <ul className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] space-y-1">
                {d.symptoms.map((s: string, i: number) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0F172A]/40 p-6 rounded-[2rem] space-y-4">
            <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">🩹 Action Plan</span>
            <div className="grid grid-cols-1 gap-2">
              {d.todo.map((t: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#0F172A]/5 dark:border-white/5 text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  <Check size={14} className="text-[#0D9488]" /> {t}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[2rem] bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 space-y-2">
              <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest flex items-center gap-2">
                <Wind size={12} /> Yoga Routine
              </span>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">{d.yoga}</p>
            </div>
            <div className="p-5 rounded-[2rem] bg-[#10B981]/5 border border-[#10B981]/10 space-y-2">
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest flex items-center gap-2">
                <Leaf size={12} /> Ayurvedic Wisdom
              </span>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">{d.ayurveda}</p>
            </div>
          </div>

          <div className="p-5 rounded-[2rem] bg-[#FF5C5C]/5 border border-[#FF5C5C]/10">
            <span className="text-[10px] font-black text-[#FF5C5C] uppercase tracking-widest flex items-center gap-2 mb-2">
              <ShieldAlert size={12} /> Seek medical help if
            </span>
            <p className="text-xs font-black text-[#FF5C5C] italic">{d.redFlags}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#0F172A]/5 dark:border-white/5">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/10 rounded-xl text-[10px] font-black text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] transition-all">
                <Plus size={14} /> Add to Routine
              </button>
            </div>
            <span className="px-3 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-full text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">
              Source: {d.source}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-6 border border-[#E2E8F0] dark:border-white/10 shadow-xl max-w-[85%]">
        <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full h-full min-h-0 px-4 md:px-0 relative z-10 overflow-hidden">
      {/* Left: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0F172A] md:rounded-[3rem] border border-[#E2E8F0] dark:border-white/10 shadow-sm overflow-hidden min-h-[500px]">
        {/* Chat Header */}
        <div className="p-6 border-b border-[#F1F5F9] dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white shadow-lg shadow-[#0D9488]/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white leading-tight">AI Copilot</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">MediSage Intel Engine v2.0</span>
              </div>
            </div>
          </div>
        </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth scrollbar-hide min-h-0"
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-10">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">How are you today?</h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] font-medium max-w-md mx-auto">Analyze symptoms, get routine fixes, or find Ayurvedic solutions instantly.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
                {[
                  { title: "Physical Symptoms", desc: "Analyze pain or discomfort", icon: Stethoscope, color: "text-[#0D9488]", bg: "bg-[#0D9488]/10" },
                  { title: "Mental Support", desc: "Fix stress or anxiety", icon: Brain, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
                  { title: "Ayurvedic Remedy", desc: "Find natural solutions", icon: Leaf, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                ].map((card, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(card.title)}
                    className="flex flex-col items-center p-6 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/10 rounded-[2.5rem] hover:border-[#0D9488] hover:bg-white dark:hover:bg-[#1E293B] transition-all group shadow-sm hover:shadow-xl hover:shadow-[#0D9488]/5"
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", card.bg, card.color)}>
                      <card.icon size={28} />
                    </div>
                    <span className="font-black text-[#0F172A] dark:text-white text-sm leading-tight mb-1">{card.title}</span>
                    <span className="text-[10px] font-bold text-[#94A3B8]">{card.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="bg-[#0D9488] text-white py-3.5 px-6 rounded-[2rem] rounded-tr-none shadow-lg shadow-[#0D9488]/20 max-w-[80%]">
                      <p className="text-sm font-bold">{msg.content}</p>
                    </div>
                  ) : (
                    renderAICard(msg)
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-[#F1F5F9] dark:bg-[#1E293B] py-3 px-5 rounded-2xl w-24 justify-center"
                >
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input bar */}
        <div className="p-6 border-t border-[#F1F5F9] dark:border-white/5 bg-white dark:bg-[#0F172A]">
          <div className="flex flex-wrap gap-2 mb-4">
            {["I have a headache", "I feel anxious", "Fix my sleep", "Back pain relief"].map((chip) => (
              <button 
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/10 rounded-xl text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488] hover:text-[#0D9488] transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-[2rem] p-2 pl-6 focus-within:ring-2 focus-within:ring-[#0D9488]/20 transition-all border border-transparent focus-within:border-[#0D9488]/30">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe your health issue..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-sm font-semibold text-[#0F172A] dark:text-white placeholder-[#94A3B8]"
            />
            <div className="flex items-center gap-1 pr-2">
              <button className="p-3 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0D9488] transition-colors">
                <Mic size={20} />
              </button>
              <button 
                onClick={() => handleSend()}
                className="bg-[#0D9488] text-white p-3.5 rounded-2xl shadow-lg shadow-[#0D9488]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Context Panel */}
      <aside className="hidden lg:flex w-[30%] flex-col gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] border border-[#E2E8F0] dark:border-white/10 p-8 shadow-sm space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center overflow-hidden">
               <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0F172A] dark:text-white">{user?.name}</h3>
              <p className="text-xs font-black text-[#0D9488] uppercase tracking-widest mt-1">Active Medical Profile</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block ml-1">Daily Vitals</span>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-500" size={16} />
                  <span className="text-xs font-black text-[#0F172A] dark:text-white">Water</span>
                </div>
                <span className="text-xs font-bold text-[#64748B]">{stats.water_ml}ml</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="text-orange-500" size={16} />
                  <span className="text-xs font-black text-[#0F172A] dark:text-white">Steps</span>
                </div>
                <span className="text-xs font-bold text-[#64748B]">{stats.steps}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#F1F5F9] dark:border-white/5">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block ml-1">Current Goals</span>
            <div className="flex flex-wrap gap-2">
              {profile?.goals?.map((goal: string) => (
                <span key={goal} className="px-3 py-1.5 bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-xl text-[10px] font-black text-[#0D9488] uppercase tracking-widest">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldAlert size={80} />
          </div>
          <div className="relative z-10">
            <h4 className="text-lg font-black leading-tight">Emergency Assistance</h4>
            <p className="text-xs font-bold text-white/60 mt-2">Instantly connect with local emergency services. 24/7 support.</p>
            <a href="tel:112" className="w-full mt-6 py-4 bg-[#FF5C5C] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#FF5C5C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center">
              SOS EMERGENCY
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
