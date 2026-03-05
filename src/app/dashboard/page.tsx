"use client";

import React, { useMemo } from "react";
import { 
  Sun, 
  Droplets, 
  Wind, 
  Check,
  CheckCircle2, 
  MessageSquare,
  Moon,
  Leaf,
  Brain,
  Activity,
  Plus as PlusIcon,
  Award,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { getISTDate } from "@/lib/dateUtils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, tasks, loading, updateWater, toggleTask, toggleSunlight } = useHealth();
  
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user?.name || "User";
  const waterLiters = (stats.water_ml / 1000).toFixed(1);
  const waterGoalLiters = 2.0;
  const hydrationPercent = Math.min(Math.round((stats.water_ml / (waterGoalLiters * 1000)) * 100), 100);
  
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  
  const hour = React.useMemo(() => {
    if (!mounted) return 12;
    return new Date().getHours();
  }, [mounted]);

  const greeting = React.useMemo(() => {
    if (!mounted) return "Good Day";
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  }, [mounted, hour]);

  const dateString = React.useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });
  }, [mounted]);

  const bannerMessage = useMemo(() => {
    if (stats.water_ml === 0 && stats.steps === 0 && !stats.sunlight_checked && !stats.sleep_logged) {
      return "Start logging your health data to see insights!";
    }
    if (hydrationPercent >= 100) {
      return "You've hit your hydration goal! Excellent work staying hydrated.";
    }
    return `You've hit ${hydrationPercent}% of your hydration goal today. Keep it up!`;
  }, [stats, hydrationPercent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D9488]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 selection:bg-[#0D9488]/20">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 p-10 rounded-[3rem] bg-gradient-to-r from-[#0F172A] to-[#0D9488] text-white relative overflow-hidden shadow-2xl shadow-[#0D9488]/20"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <PlusIcon size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-3 block">{dateString}</span>
            <h1 className="text-5xl font-black tracking-tight mb-2 font-pjs leading-tight">
              {greeting}, {userName} <span className="text-[#10B981]">MediSage AI</span> is tracking your vitals.
            </h1>
            <p className="text-white/70 font-medium text-lg max-w-xl">
              {bannerMessage}
            </p>
          </div>
            <Link href="/trackers" className="flex items-center gap-3 bg-white text-[#0F172A] px-8 py-5 rounded-[2rem] font-black shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all text-sm group">
              <PlusIcon size={20} className="group-hover:rotate-90 transition-transform" /> Log Today&apos;s Metrics
            </Link>
        </div>
      </motion.div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Column 1: Wellness Score */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center justify-between min-h-[450px]"
        >
          <div className="w-full text-left mb-6">
            <h2 className="text-xl font-black text-[#0F172A] dark:text-white font-pjs">Wellness Score</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Real-time update</p>
            </div>
          </div>

          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="14"
                fill="transparent"
                className="text-[#F1F5F9] dark:text-[#1E293B]"
              />
              <motion.circle
                cx="112"
                cy="112"
                r="90"
                stroke="url(#scoreGradient)"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 90}
                initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - stats.wellness_score / 100) }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(13,148,136,0.3)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black text-[#0F172A] dark:text-white font-pjs">{stats.wellness_score}</span>
              <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest mt-1">
                {stats.wellness_score >= 80 ? "Status: Excellent" : stats.wellness_score >= 50 ? "Status: Good" : "Status: Needs Focus"}
              </span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Your Wellness Score Today</p>
            <Link 
              href="/wrapped"
              className="w-full py-4 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#8B5CF6]/20 transition-all border border-[#8B5CF6]/10"
            >
              View Weekly Wrapped 🎁
            </Link>
          </div>
        </motion.div>

        {/* Column 2: Today's Tasks */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-2xl shadow-slate-200/50 flex flex-col min-h-[450px]"
        >
          <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] dark:text-white font-pjs">Today&apos;s Tasks</h2>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Health Routine</p>
              </div>
            {totalTasks > 0 && (
              <div className="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {completedTasksCount}/{totalTasks} Done
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 mb-8 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
            {totalTasks === 0 ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto text-[#94A3B8]">
                  <Zap size={32} />
                </div>
                <p className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">No tasks for today yet.</p>
                <Link href="/planner" className="text-xs font-black text-[#0D9488] uppercase tracking-widest hover:underline">
                  Go to Planner
                </Link>
              </div>
            ) : (
              tasks.map((task) => (
                <button 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                    task.completed 
                      ? "bg-[#0D9488]/5 border-[#0D9488]/20" 
                      : "bg-[#F8FAFC] dark:bg-[#0F172A] border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10 hover:bg-white dark:hover:bg-[#1E293B]"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    task.completed ? "bg-[#0D9488] border-[#0D9488]" : "border-[#CBD5E1] group-hover:border-[#94A3B8]"
                  )}>
                    {task.completed && <Check size={14} className="text-white" />}
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-all",
                    task.completed ? "text-[#94A3B8] line-through" : "text-[#0F172A] dark:text-white"
                  )}>
                    {task.title}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Water Tracker */}
          <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-6 rounded-[2rem] border border-[#E2E8F0] dark:border-white/5 space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Droplets size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block">Hydration</span>
                  <span className="text-lg font-black text-[#0F172A] dark:text-white font-pjs">{waterLiters}L <span className="text-[#94A3B8] font-bold text-xs italic">/ {waterGoalLiters}L</span></span>
                </div>
              </div>
              <button 
                onClick={() => updateWater(stats.water_ml + 250)}
                className="w-10 h-10 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-xl flex items-center justify-center text-blue-500 shadow-sm hover:scale-110 active:scale-90 transition-all"
              >
                <PlusIcon size={20} />
              </button>
            </div>
            <div className="h-3 w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${hydrationPercent}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-[#0D9488] relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Column 3: Circadian Rhythm */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A] dark:bg-[#1E293B] p-8 rounded-[2.5rem] text-white flex flex-col min-h-[450px] overflow-hidden relative shadow-2xl shadow-[#0F172A]/30"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sun size={150} />
          </div>

          <div className="relative z-10 mb-8">
            <h2 className="text-xl font-black font-pjs">Circadian Rhythm</h2>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Biological Clock Sync</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-full max-w-[260px] aspect-[2/1] mb-10">
              {/* Sun arc */}
              <svg viewBox="0 0 100 50" className="w-full">
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="141.37"
                  initial={{ strokeDashoffset: 141.37 }}
                  animate={{ strokeDashoffset: 141.37 * (1 - hour / 24) }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                />
                <circle cx="5" cy="50" r="1.5" fill="rgba(255,255,255,0.2)" />
                <circle cx="95" cy="50" r="1.5" fill="rgba(255,255,255,0.2)" />
              </svg>
              
              <div className="absolute inset-x-0 bottom-0 text-center translate-y-2">
                <span className="text-4xl font-black font-pjs block">{stats.steps}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mt-2">Steps Logged</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-colors">
                <span className="text-[9px] font-black text-white/30 block mb-1 uppercase tracking-widest">Sunlight</span>
                <span className={cn("text-sm font-black", stats.sunlight_checked ? "text-[#0D9488]" : "text-white/60")}>
                  {stats.sunlight_checked ? "Received" : "Pending"}
                </span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-colors">
                <span className="text-[9px] font-black text-white/30 block mb-1 uppercase tracking-widest">Sleep</span>
                <span className={cn("text-sm font-black", stats.sleep_logged ? "text-indigo-400" : "text-white/60")}>
                  {stats.sleep_logged ? "Logged" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={toggleSunlight}
            className={cn(
                "w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all relative z-10 shadow-xl border border-white/10",
                stats.sunlight_checked ? "bg-white/10 text-white" : "bg-[#0D9488] text-white shadow-[#0D9488]/20"
            )}
          >
            {stats.sunlight_checked ? <CheckCircle2 size={18} /> : <Sun size={18} />} 
            {stats.sunlight_checked ? "Sunlight Received" : "Morning Light Check-in"}
          </button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">AI Prescriptions & Routines</h2>
          <Link href="/planner" className="text-xs font-black text-[#0D9488] uppercase tracking-widest hover:underline transition-all">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Create my daily routine", icon: Activity, color: "bg-[#0F172A]", shadow: "shadow-[#0F172A]/10" },
            { label: "Fix my sleep", icon: Moon, color: "bg-[#8B5CF6]", shadow: "shadow-[#8B5CF6]/10" },
            { label: "Recommend yoga", icon: Wind, color: "bg-[#10B981]", shadow: "shadow-[#10B981]/10" },
            { label: "Explain my report", icon: Brain, color: "bg-[#0D9488]", shadow: "shadow-[#0D9488]/10" },
            { label: "Improve my diet", icon: Leaf, color: "bg-[#0F172A]", shadow: "shadow-[#0F172A]/10" },
          ].map((action, i) => (
            <Link 
              key={i}
              href={`/chat?query=${encodeURIComponent(action.label)}`}
              className={cn(
                "flex flex-col items-start gap-4 bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border border-white dark:border-white/10 p-6 rounded-[2rem] transition-all group hover:bg-white dark:hover:bg-[#1E293B] hover:border-[#0D9488]/30 shadow-sm",
                "hover:shadow-2xl hover:shadow-[#0D9488]/5"
              )}
            >
              <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white transition-all group-hover:scale-110 group-hover:rotate-6 shadow-lg", action.color, action.shadow)}>
                <action.icon size={22} />
              </div>
              <span className="font-black text-[#0F172A] dark:text-white text-xs leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
