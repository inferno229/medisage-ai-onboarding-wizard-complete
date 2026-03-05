"use client";

import React, { useState, useEffect } from "react";
import { 
  Utensils, 
  Moon, 
  Droplets, 
  Sun, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  ChevronRight,
  Activity,
  Zap,
  Star,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type Tab = "Nutrition" | "Sleep" | "Steps & Water" | "Sunlight";

export default function TrackersPage() {
  const { user } = useAuth();
  const { stats, updateWater, updateSteps, toggleSunlight, toggleSleep } = useHealth();
  
  const [activeTab, setActiveTab] = useState<Tab>("Nutrition");
  const [mealInput, setMealInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);
  
  const [bedtime, setBedtime] = useState("23:30");
  const [wakeTime, setWakeTime] = useState("07:30");
  const [sleepQuality, setSleepQuality] = useState(4);

  const tabs: Tab[] = ["Nutrition", "Sleep", "Steps & Water", "Sunlight"];

  const analyzeMeal = async () => {
    if (!mealInput) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal: mealInput })
      });
      const data = await response.json();
      setMealResult(data);
    } catch (err) {
      console.error("Meal analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveSleep = async () => {
    // Save sleep data to Supabase (assuming a sleep_logs table or just toggle today)
    await toggleSleep();
    alert("Sleep data logged!");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 selection:bg-[#0D9488]/20 px-4 md:px-0">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Health Trackers</h1>
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Real-time vitals monitoring</p>
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-[#F1F5F9] dark:bg-[#1E293B] p-1.5 rounded-[2rem] mb-10 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-4 px-6 rounded-[1.75rem] text-sm font-black transition-all whitespace-nowrap",
              activeTab === tab 
                ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-lg shadow-[#0F172A]/5" 
                : "text-[#94A3B8] hover:text-[#64748B]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Nutrition" && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/10 shadow-sm">
                <h3 className="text-xl font-black text-[#0F172A] dark:text-white mb-6">Analyze Your Meal</h3>
                <div className="space-y-4">
                  <textarea 
                    value={mealInput}
                    onChange={(e) => setMealInput(e.target.value)}
                    placeholder="Tell me what you ate (e.g., Grilled chicken salad with quinoa and avocado)"
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]/40 border-2 border-[#F1F5F9] dark:border-white/5 rounded-[2rem] p-6 font-bold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all min-h-[120px] resize-none dark:text-white"
                  />
                  <button 
                    onClick={analyzeMeal}
                    disabled={analyzing || !mealInput}
                    className="w-full py-5 bg-[#0D9488] text-white rounded-[2rem] font-black shadow-xl shadow-[#0D9488]/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {analyzing ? <Sparkles className="animate-spin" /> : <Sparkles />}
                    {analyzing ? "Analyzing with AI..." : "Analyze Meal Quality"}
                  </button>
                </div>

                {mealResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 pt-8 border-t border-[#F1F5F9] dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]/40 rounded-[2rem] p-8 border border-[#F1F5F9] dark:border-white/5">
                       <div className="text-6xl font-black text-[#0D9488] mb-2">{mealResult.score}<span className="text-2xl text-[#94A3B8]">/10</span></div>
                       <span className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">Health Score</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#F1F5F9] dark:border-white/5">
                        <span className="text-xs font-black text-[#0F172A] dark:text-white">Protein: {mealResult.protein}</span>
                        <div className="bg-[#10B981]/10 text-[#10B981] p-1.5 rounded-lg"><CheckCircle2 size={16} /></div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#F1F5F9] dark:border-white/5">
                        <span className="text-xs font-black text-[#0F172A] dark:text-white">Veg Variety: {mealResult.vegetables}</span>
                        <div className="bg-orange-500/10 text-orange-500 p-1.5 rounded-lg font-black text-[10px]">{mealResult.vegetables === 'Low' ? '⚠️ LOW' : 'GOOD'}</div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#F1F5F9] dark:border-white/5">
                        <span className="text-xs font-black text-[#0F172A] dark:text-white">Carbs: {mealResult.carbs}</span>
                        <div className="bg-[#10B981]/10 text-[#10B981] p-1.5 rounded-lg"><CheckCircle2 size={16} /></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {mealResult && (
                <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white">
                  <h4 className="text-lg font-black mb-4">AI Nutritional Tip</h4>
                  <p className="text-sm font-bold text-white/60 leading-relaxed italic">
                    "{mealResult.tip}"
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Sleep" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/10 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-[#0F172A] dark:text-white">Log Sleep</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Bedtime</label>
                      <input 
                        type="time" 
                        value={bedtime}
                        onChange={(e) => setBedtime(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold dark:text-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Wake up</label>
                      <input 
                        type="time" 
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Quality Rating</label>
                    <div className="flex justify-between bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                            key={s} 
                            onClick={() => setSleepQuality(s)}
                            className={cn("p-2 transition-transform", sleepQuality >= s ? "text-orange-400 scale-110" : "text-[#94A3B8] hover:scale-125")}
                        >
                          <Star size={24} fill={sleepQuality >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveSleep}
                    className={cn(
                        "w-full py-5 rounded-[2rem] font-black shadow-xl transition-all",
                        stats.sleep_logged ? "bg-[#10B981] text-white" : "bg-[#8B5CF6] text-white shadow-[#8B5CF6]/20 hover:scale-[1.02]"
                    )}
                  >
                    {stats.sleep_logged ? "Sleep Logged ✅" : "Save Sleep Data"}
                  </button>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0F172A]/40 rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">Insights</span>
                    <h3 className="text-xl font-black text-[#0F172A] dark:text-white mt-2">Circadian Sync</h3>
                    <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-2">Consistent sleep timing is the #1 way to improve energy and cognitive function.</p>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-[#F1F5F9] dark:border-white/5 mt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                            <Moon size={24} />
                        </div>
                        <div>
                            <span className="text-sm font-black text-[#0F172A] dark:text-white">Today's Duration</span>
                            <span className="text-[10px] font-bold text-[#94A3B8] block">Estimated: 8h 00m</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Steps & Water" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Steps */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/10 shadow-sm flex flex-col items-center text-center">
                  <h3 className="text-xl font-black text-[#0F172A] dark:text-white w-full text-left mb-8">Daily Steps</h3>
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-[#F1F5F9] dark:text-[#0F172A]" />
                      <motion.circle
                        cx="112" cy="112" r="90" stroke="#0D9488" strokeWidth="14" fill="transparent"
                        strokeDasharray={2 * Math.PI * 90}
                        initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - Math.min(stats.steps / 10000, 1)) }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-[#0F172A] dark:text-white">{stats.steps}</span>
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">/ 10,000 Steps</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-10 w-full">
                    <button 
                        onClick={() => updateSteps(Math.max(stats.steps - 500, 0))}
                        className="flex-1 py-4 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#64748B] hover:text-[#0D9488] transition-colors"
                    >
                        <Minus size={20} />
                    </button>
                    <button 
                        onClick={() => updateSteps(stats.steps + 500)}
                        className="flex-[2] py-4 bg-[#0D9488] text-white rounded-2xl font-black shadow-lg shadow-[#0D9488]/20"
                    >
                        + 500 Steps
                    </button>
                  </div>
                </div>

                {/* Water */}
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A]/40 rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/5 space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-[#0F172A] dark:text-white">Hydration</h3>
                    <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-white/5 shadow-sm">
                      <div className="text-2xl font-black text-blue-500">{stats.water_ml}ml</div>
                      <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Goal: 2,000ml</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end justify-center gap-1.5 h-40">
                    {[...Array(8)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ scaleY: 0.1 }}
                        animate={{ scaleY: stats.water_ml >= (i + 1) * 250 ? 1 : 0.2 }}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          stats.water_ml >= (i + 1) * 250 ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-[#E2E8F0] dark:bg-[#1E293B]"
                        )}
                        style={{ height: '100%' }}
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => updateWater(stats.water_ml + 250)}
                      className="w-full py-5 bg-blue-500 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Plus /> Add 250ml Glass
                    </button>
                    <button 
                      onClick={() => updateWater(Math.max(stats.water_ml - 250, 0))}
                      className="w-full py-3 bg-transparent text-[#94A3B8] font-black hover:text-blue-500 transition-colors"
                    >
                      Remove Last Glass
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Sunlight" && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-12 border border-[#E2E8F0] dark:border-white/10 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center text-orange-500 mb-8 shadow-xl shadow-orange-500/10">
                  <Sun size={48} />
                </div>
                <h3 className="text-3xl font-black text-[#0F172A] dark:text-white">Circadian Alignment</h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] font-medium mt-4 max-w-sm">Morning light before 9 AM helps set your biological clock and boosts serotonin.</p>
                
                <div className="mt-12 w-full max-w-sm space-y-6">
                  <button 
                    onClick={toggleSunlight}
                    className={cn(
                      "w-full py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 transition-all text-lg shadow-xl",
                      stats.sunlight_checked 
                        ? "bg-[#10B981]/10 text-[#10B981] shadow-none" 
                        : "bg-orange-500 text-white shadow-orange-500/20 hover:scale-[1.02]"
                    )}
                  >
                    {stats.sunlight_checked ? <CheckCircle2 size={24} /> : <Sun size={24} />}
                    {stats.sunlight_checked ? "Check-in Complete" : "I got morning sunlight ☀️"}
                  </button>
                  
                  <div className="flex items-center justify-center gap-3 text-2xl font-black text-[#0F172A] dark:text-white">
                    {stats.sunlight_checked ? "Today's Streak Continued!" : "Start today's streak"} <span className="text-orange-500 animate-bounce">🔥</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white flex items-center gap-6 overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <Zap size={150} />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#0D9488]/20 flex items-center justify-center text-[#0D9488] shrink-0">
                  <Activity size={32} />
                </div>
                <div>
                  <h4 className="font-black text-lg">Did you know?</h4>
                  <p className="text-sm font-medium text-white/60 mt-1">Direct sunlight exposure triggers the release of serotonin, making you feel more alert and focused.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
