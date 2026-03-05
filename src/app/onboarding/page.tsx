"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Activity, 
  Moon, 
  Leaf, 
  Wind,
  Brain,
  Stethoscope,
  Heart,
  LayoutDashboard,
  Zap,
  Target,
  Plus as PlusIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getISTDate } from "@/lib/dateUtils";

// Types for wizard steps
type OnboardingData = {
  ageGroup: string;
  gender: string;
  goals: string[];
  currentProblems: string[];
  workType: string;
  dailySteps: string;
  diet: string;
  bedtime: string;
  wakeupTime: string;
  sleepIssue: string;
  conditions: string[];
  familyHistory: string[];
  ayurveda: boolean;
  yoga: boolean;
  reminderStyle: string;
  customGoal: string;
  customProblem: string;
  customCondition: string;
  customFamilyHistory: string;
};

const initialData: OnboardingData = {
  ageGroup: "",
  gender: "",
  goals: [],
  currentProblems: [],
  workType: "",
  dailySteps: "",
  diet: "",
  bedtime: "",
  wakeupTime: "",
  sleepIssue: "",
  conditions: [],
  familyHistory: [],
  ayurveda: true,
  yoga: true,
  reminderStyle: "Regular",
  customGoal: "",
  customProblem: "",
  customCondition: "",
  customFamilyHistory: "",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { updateOnboarding, user } = useAuth();

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    const storedData = localStorage.getItem("onboardingData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: keyof OnboardingData, value: string, limit: number) => {
    const current = (data[key] as string[]) || [];
    if (current.includes(value)) {
      updateData(key, current.filter((v) => v !== value));
    } else {
      if (value === "None") {
        updateData(key, ["None"]);
      } else {
        const filtered = current.filter(v => v !== "None");
        if (filtered.length < limit) {
          updateData(key, [...filtered, value]);
        }
      }
    }
  };

  const convertBedtimeToTime = (bedtimeLabel: string): string => {
    if (!bedtimeLabel) return "22:00:00";
    
    // Normalize the label - replace all types of dashes with regular dash
    const normalized = bedtimeLabel.replace(/–|—|-/g, '-').trim();
    
    const timeMap: Record<string, string> = {
      "Before 10PM": "21:00:00",
      "10PM-12AM": "22:00:00",
      "12AM-2AM": "00:00:00",
      "After 2AM": "02:30:00"
    };
    
    const result = timeMap[normalized];
    console.log("[v0] Converting bedtime:", { input: bedtimeLabel, normalized, result });
    return result || "22:00:00";
  };

  const convertWakeupToTime = (wakeupLabel: string): string => {
    if (!wakeupLabel) return "06:30:00";
    
    // Normalize the label - replace all types of dashes with regular dash
    const normalized = wakeupLabel.replace(/–|—|-/g, '-').trim();
    
    const timeMap: Record<string, string> = {
      "Before 6AM": "05:00:00",
      "6-8AM": "06:30:00",
      "8-10AM": "08:00:00",
      "After 10AM": "10:30:00"
    };
    
    const result = timeMap[normalized];
    console.log("[v0] Converting wakeup:", { input: wakeupLabel, normalized, result });
    return result || "06:30:00";
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setIsSaving(true);
    
    // Process final lists to include custom inputs if "Other" was selected
    const finalGoals = data.goals.map(g => g === "Other" ? data.customGoal : g).filter(g => g && g !== "Other");
    const finalProblems = data.currentProblems.map(p => p === "Other" ? data.customProblem : p).filter(p => p && p !== "Other");
    const finalConditions = data.conditions.map(c => c === "Other" ? data.customCondition : c).filter(c => c && c !== "Other");
    const finalFamilyHistory = data.familyHistory.map(f => f === "Other" ? data.customFamilyHistory : f).filter(f => f && f !== "Other");

    try {
      // 1. Save to user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          age_group: data.ageGroup,
          gender: data.gender,
          goals: finalGoals,
          current_problems: finalProblems,
          work_type: data.workType,
          daily_steps_goal: data.dailySteps,
          diet: data.diet,
          bedtime: convertBedtimeToTime(data.bedtime),
          wakeup_time: convertWakeupToTime(data.wakeupTime),
          sleep_issue: data.sleepIssue,
          conditions: finalConditions,
          family_history: finalFamilyHistory,
          ayurveda_enabled: data.ayurveda,
          yoga_enabled: data.yoga,
          reminder_style: data.reminderStyle,
          onboarding_completed: true
        });

      if (profileError) throw profileError;

      // 2. Initialize daily log for today (Zero start policy)
      const today = getISTDate();
      const { error: logError } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          date: today,
          water_ml: 0,
          steps: 0,
          sunlight_checked: false,
          sleep_logged: false,
          wellness_score: 0
        }, { onConflict: 'user_id,date' });

      if (logError) throw logError;

      // 3. Update auth metadata
      await updateOnboarding(true);
      
      localStorage.removeItem("onboardingData");
      console.log("[v0] Onboarding completed successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("[v0] Failed to complete onboarding", error);
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      console.error("[v0] Error details:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      alert(`Onboarding error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 1.05,
      filter: "blur(4px)"
    })
  };

  const [[page, direction], setPage] = useState([1, 0]);

  const paginate = (newStep: number) => {
    setPage([newStep, newStep > step ? 1 : -1]);
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaginatedNext = () => {
    if (step < totalSteps) paginate(step + 1);
  };

  const handlePaginatedBack = () => {
    if (step > 1) paginate(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-12 py-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-32 h-32 bg-[#0D9488]/10 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-[#0D9488]/10 group hover:rotate-6 transition-all"
            >
                <PlusIcon size={64} className="text-[#0D9488]" />
            </motion.div>
            <div className="space-y-6">
              <h1 className="text-5xl font-black text-[#0F172A] tracking-tight leading-tight">Welcome to <span className="text-[#0D9488]">MediSage AI</span></h1>
              <p className="text-[#64748B] text-xl font-medium max-w-sm mx-auto leading-relaxed">Let's understand your health in 2 minutes to provide elite personalized care.</p>
            </div>
            <div className="pt-10">
              <button 
                onClick={handlePaginatedNext}
                className="w-full bg-[#0F172A] text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#0F172A]/20 group"
              >
                Start Health Setup <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-10 py-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-[0.3em]">Step 02/09</span>
              <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Basic Info</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">Help us tailor your medical profile.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Age Group</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"].map((age) => (
                    <button
                      key={age}
                      onClick={() => updateData("ageGroup", age)}
                      className={cn(
                        "py-5 px-5 rounded-[2rem] border-2 text-sm font-black transition-all flex items-center justify-between group",
                        data.ageGroup === age 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{age}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.ageGroup === age ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.ageGroup === age && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Gender (optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Male", "Female", "Other", "Private"].map((g) => (
                    <button
                      key={g}
                      onClick={() => updateData("gender", g)}
                      className={cn(
                        "py-5 px-5 rounded-[2rem] border-2 text-sm font-black transition-all flex items-center justify-between group",
                        data.gender === g 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{g}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.gender === g ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.gender === g && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-10 py-4">
            <div className="space-y-2">
               <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.3em]">Step 03/09</span>
              <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Your Goals</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">What do you want to achieve? (Up to 3)</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pr-2">
              {[
                { name: "Better Sleep", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50" },
                { name: "Reduce Stress", icon: Brain, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5" },
                { name: "Lose Weight", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
                { name: "Build Fitness", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
                { name: "Fix Pain", icon: Stethoscope, color: "text-red-500", bg: "bg-red-50" },
                { name: "Improve Digestion", icon: Leaf, color: "text-[#10B981]", bg: "bg-[#10B981]/5" },
                { name: "General Wellness", icon: Heart, color: "text-[#0D9488]", bg: "bg-[#0D9488]/5" },
                { name: "Other", icon: Edit3, color: "text-[#64748B]", bg: "bg-[#64748B]/5" }
              ].map((goal) => (
                <div key={goal.name} className="space-y-3">
                  <button
                    onClick={() => toggleMultiSelect("goals", goal.name, 3)}
                    className={cn(
                      "w-full flex items-center justify-between py-6 px-8 rounded-[2.5rem] border-2 text-sm font-black transition-all group",
                      data.goals.includes(goal.name) 
                        ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-xl shadow-[#0D9488]/10" 
                        : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", data.goals.includes(goal.name) ? "bg-[#0D9488] text-white" : goal.bg, data.goals.includes(goal.name) ? "" : goal.color)}>
                         <goal.icon size={20} />
                      </div>
                      {goal.name}
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      data.goals.includes(goal.name) ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                    )}>
                      {data.goals.includes(goal.name) && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                  {goal.name === "Other" && data.goals.includes("Other") && (
                    <motion.input
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      placeholder="Type your custom goal..."
                      className="w-full px-8 py-4 rounded-2xl border-2 border-[#0D9488] bg-white text-sm font-medium focus:outline-none shadow-lg"
                      value={data.customGoal}
                      onChange={(e) => updateData("customGoal", e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

        case 4:
          return (
            <div className="space-y-10 py-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#FF5C5C] uppercase tracking-[0.3em]">Step 04/09</span>
                <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Current Problems</h2>
                <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">Is something bothering you? (Up to 2)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 pr-2">
                {[
                  "Cold & Cough", "Headache", "Back or Neck Pain", 
                  "Chest Discomfort", "Acidity", "Fatigue", 
                  "Low Mood", "Anxiety", "None", "Other"
                ].map((prob) => (
                  <div key={prob} className="space-y-3">
                    <button
                      onClick={() => toggleMultiSelect("currentProblems", prob, 2)}
                      className={cn(
                        "w-full flex items-center justify-between py-6 px-8 rounded-[2.5rem] border-2 text-sm font-black transition-all group",
                        data.currentProblems.includes(prob) 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-xl shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      {prob}
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.currentProblems.includes(prob) ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.currentProblems.includes(prob) && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                    {prob === "Other" && data.currentProblems.includes("Other") && (
                      <motion.input
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        type="text"
                        placeholder="Type your current problem..."
                        className="w-full px-8 py-4 rounded-2xl border-2 border-[#0D9488] bg-white text-sm font-medium focus:outline-none shadow-lg"
                        value={data.customProblem}
                        onChange={(e) => updateData("customProblem", e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );


      case 5:
        return (
          <div className="space-y-10 py-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">Step 05/09</span>
              <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Lifestyle</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">How's your daily routine?</p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Work Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Student", "Desk Job", "Active Job", "Manual Work"].map((w) => (
                    <button
                      key={w}
                      onClick={() => updateData("workType", w)}
                      className={cn(
                        "py-5 px-5 rounded-[2rem] border-2 text-xs font-black transition-all flex items-center justify-between group",
                        data.workType === w 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{w}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.workType === w ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.workType === w && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Daily Steps</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Less than 3K", "3K–7K", "7K–10K", "10K+"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateData("dailySteps", s)}
                      className={cn(
                        "py-5 px-5 rounded-[2rem] border-2 text-xs font-black transition-all flex items-center justify-between group",
                        data.dailySteps === s 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{s}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.dailySteps === s ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.dailySteps === s && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Diet</label>
                <div className="grid grid-cols-1 gap-3">
                  {["Mostly Homemade", "Mix of Both", "Mostly Outside Food"].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateData("diet", d)}
                      className={cn(
                        "py-6 px-8 rounded-[2.5rem] border-2 text-sm font-black transition-all text-left flex items-center justify-between group",
                        data.diet === d 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{d}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.diet === d ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.diet === d && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-10 py-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.3em]">Step 06/09</span>
              <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Sleep</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">Optimizing your rest cycle.</p>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Bedtime</label>
                  <div className="space-y-3">
                    {["Before 10PM", "10PM–12AM", "12AM–2AM", "After 2AM"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateData("bedtime", t)}
                        className={cn(
                          "w-full py-4 px-4 rounded-2xl border-2 text-[10px] font-black transition-all flex items-center justify-between group",
                          data.bedtime === t 
                            ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                            : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                        )}
                      >
                        <span>{t}</span>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                          data.bedtime === t ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                        )}>
                          {data.bedtime === t && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Wake-up</label>
                  <div className="space-y-3">
                    {["Before 6AM", "6–8AM", "8–10AM", "After 10AM"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateData("wakeupTime", t)}
                        className={cn(
                          "w-full py-4 px-4 rounded-2xl border-2 text-[10px] font-black transition-all flex items-center justify-between group",
                          data.wakeupTime === t 
                            ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                            : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                        )}
                      >
                        <span>{t}</span>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                          data.wakeupTime === t ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                        )}>
                          {data.wakeupTime === t && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Sleep Issue</label>
                <div className="grid grid-cols-1 gap-3">
                  {["None", "Hard to fall asleep", "Wake up often", "Feel tired after waking"].map((i) => (
                    <button
                      key={i}
                      onClick={() => updateData("sleepIssue", i)}
                      className={cn(
                        "py-6 px-8 rounded-[2.5rem] border-2 text-sm font-black transition-all text-left flex items-center justify-between group",
                        data.sleepIssue === i 
                          ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                          : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                      )}
                    >
                      <span>{i}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        data.sleepIssue === i ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                      )}>
                        {data.sleepIssue === i && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

        case 7:
          return (
            <div className="space-y-10 py-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-[0.3em]">Step 07/09</span>
                <h2 className="text-4xl font-black text-[#0F172A] dark:text-[#F1F5F9]">Medical History</h2>
                <p className="text-[#64748B] dark:text-[#94A3B8] font-medium text-lg">Know your roots and conditions.</p>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Known Conditions</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Diabetes", "High BP", "Asthma", "Thyroid", "Migraine", "None", "Other"].map((c) => (
                      <div key={c} className="space-y-3">
                        <button
                          onClick={() => toggleMultiSelect("conditions", c, 5)}
                          className={cn(
                            "w-full py-5 px-5 rounded-[2rem] border-2 text-xs font-black transition-all flex items-center justify-between group",
                            data.conditions.includes(c) 
                              ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                              : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                          )}
                        >
                          <span>{c}</span>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            data.conditions.includes(c) ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                          )}>
                            {data.conditions.includes(c) && <Check size={12} className="text-white" />}
                          </div>
                        </button>
                        {c === "Other" && data.conditions.includes("Other") && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            placeholder="Type condition..."
                            className="w-full px-5 py-3 rounded-xl border-2 border-[#0D9488] bg-white text-xs font-medium focus:outline-none"
                            value={data.customCondition}
                            onChange={(e) => updateData("customCondition", e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-2">Family History</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Diabetes", "Heart Disease", "High BP", "Stroke", "None", "Other"].map((h) => (
                      <div key={h} className="space-y-3">
                        <button
                          onClick={() => toggleMultiSelect("familyHistory", h, 4)}
                          className={cn(
                            "w-full py-5 px-5 rounded-[2rem] border-2 text-xs font-black transition-all flex items-center justify-between group",
                            data.familyHistory.includes(h) 
                              ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488] shadow-lg shadow-[#0D9488]/10" 
                              : "bg-white dark:bg-[#1E293B] border-[#F1F5F9] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-[#0D9488]/30"
                          )}
                        >
                          <span>{h}</span>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            data.familyHistory.includes(h) ? "bg-[#0D9488] border-[#0D9488]" : "border-[#E2E8F0] dark:border-[#475569] group-hover:border-[#0D9488]/50"
                          )}>
                            {data.familyHistory.includes(h) && <Check size={12} className="text-white" />}
                          </div>
                        </button>
                        {h === "Other" && data.familyHistory.includes("Other") && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            placeholder="Type family history..."
                            className="w-full px-5 py-3 rounded-xl border-2 border-[#0D9488] bg-white text-xs font-medium focus:outline-none"
                            value={data.customFamilyHistory}
                            onChange={(e) => updateData("customFamilyHistory", e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );


      case 8:
        return (
          <div className="space-y-10 py-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">Step 08/09</span>
              <h2 className="text-4xl font-black text-[#0F172A]">Preferences</h2>
              <p className="text-[#64748B] font-medium text-lg">Customize your MediSage experience.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-8 bg-white rounded-[3rem] border-2 border-[#F1F5F9] group hover:border-[#10B981]/30 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                    <Leaf size={32} />
                  </div>
                  <div>
                    <span className="font-black text-xl block text-[#0F172A]">Ayurveda Tips</span>
                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1 block">Natural healing insights</span>
                  </div>
                </div>
                <button 
                  onClick={() => updateData("ayurveda", !data.ayurveda)}
                  className={cn(
                    "w-16 h-8 rounded-full transition-all relative p-1",
                    data.ayurveda ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                  )}
                >
                  <motion.div 
                    layout
                    className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-lg",
                      data.ayurveda ? "ml-auto" : "ml-0"
                    )} 
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-8 bg-white rounded-[3rem] border-2 border-[#F1F5F9] group hover:border-[#8B5CF6]/30 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
                    <Wind size={32} />
                  </div>
                  <div>
                    <span className="font-black text-xl block text-[#0F172A]">Yoga Daily</span>
                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1 block">Custom flow routines</span>
                  </div>
                </div>
                <button 
                  onClick={() => updateData("yoga", !data.yoga)}
                  className={cn(
                    "w-16 h-8 rounded-full transition-all relative p-1",
                    data.yoga ? "bg-[#8B5CF6]" : "bg-[#E2E8F0]"
                  )}
                >
                  <motion.div 
                    layout
                    className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-lg",
                      data.yoga ? "ml-auto" : "ml-0"
                    )} 
                  />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest block ml-4">Reminder Style</label>
                <div className="grid grid-cols-3 gap-4">
                  {["Gentle", "Regular", "Strict"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateData("reminderStyle", s)}
                      className={cn(
                        "py-6 px-2 rounded-[2rem] border-2 text-[10px] font-black transition-all",
                        data.reminderStyle === s ? "bg-[#0D9488] border-[#0D9488] text-white shadow-xl" : "bg-white border-[#F1F5F9] text-[#64748B]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        // Calculate risks
        const risks = [];
        if (data.sleepIssue !== "None" || data.bedtime === "After 2AM") risks.push("IrregularSleep");
        if (data.currentProblems.includes("Anxiety") || data.currentProblems.includes("Low Mood") || data.currentProblems.includes("Other")) risks.push("HighStress");
        if (data.dailySteps === "Less than 3K" && data.workType === "Desk Job") risks.push("Sedentary");
        if (data.familyHistory.includes("Diabetes") || data.familyHistory.includes("Other")) risks.push("FamilyRiskDiabetes");
        if (data.familyHistory.includes("Heart Disease")) risks.push("FamilyRiskCardio");

        return (
          <div className="space-y-12 py-10">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[#0D9488]/10 text-[#0D9488]">
                <ShieldCheck size={64} />
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">Health Blueprint</h2>
                <p className="text-[#64748B] font-medium text-xl">Your elite medical profile is synchronized.</p>
              </div>
            </div>

            <div className="bg-white rounded-[4rem] p-12 border-2 border-[#F1F5F9] shadow-2xl shadow-slate-200/50 space-y-12 relative overflow-hidden">
               {/* Decor */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0D9488]/10 to-transparent rounded-bl-[100px]" />
               
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-32 h-32 rounded-[3rem] bg-[#F8FAFC] flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                    <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="font-black text-4xl text-[#0F172A] tracking-tight">{user?.name}</div>
                    <div className="text-lg font-bold text-[#64748B]">{data.ageGroup} • {data.gender}</div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">

                    {data.goals.map(g => (
                       <span key={g} className="bg-[#F1F5F9] text-[#0D9488] px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-[#E2E8F0]">#{g === "Other" ? data.customGoal : g.replace(' ', '')}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t-2 border-[#F1F5F9]">
                <span className="text-xs font-black text-[#94A3B8] uppercase tracking-[0.3em] block text-center">Identified Risk Factors</span>
                <div className="flex flex-wrap justify-center gap-3">
                  {risks.length > 0 ? risks.map(risk => (
                    <span key={risk} className={cn(
                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border-2",
                      risk.includes("Risk") 
                        ? "bg-[#FF5C5C]/5 border-[#FF5C5C]/20 text-[#FF5C5C]" 
                        : "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6]"
                    )}>
                      {risk}
                    </span>
                  )) : (
                    <div className="flex items-center gap-3 text-sm font-black text-[#0D9488] bg-[#0D9488]/5 px-8 py-4 rounded-[2rem] border-2 border-[#0D9488]/20">
                      <Award /> Perfect Score! No major risks.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="text-center p-8 rounded-[3rem] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-[10px] text-[#94A3B8] uppercase font-black tracking-widest">Metabolism</div>
                  <div className="text-lg font-black text-[#0F172A]">{data.dailySteps}</div>
                </div>
                <div className="text-center p-8 rounded-[3rem] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-[10px] text-[#94A3B8] uppercase font-black tracking-widest">Chronotype</div>
                  <div className="text-lg font-black text-[#0F172A]">{data.bedtime}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={completeOnboarding}
              disabled={isSaving}
              className="w-full bg-[#0F172A] text-white font-black py-7 rounded-[3rem] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#0F172A]/30 group text-xl disabled:opacity-50"
            >
              {isSaving ? "Saving Profile..." : <>Enter MediSage AI <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" /></>}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6 md:p-12 overflow-x-hidden selection:bg-[#0D9488]/20 selection:text-[#0D9488] font-pjs relative">
        {/* Background Decor - More Colorful */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0D9488]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-orange-500/5 rounded-full blur-[100px]" />
        
        {/* Progress Header */}
        <div className="w-full max-w-2xl mb-12 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={handlePaginatedBack}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-xl border border-white shadow-xl hover:bg-white hover:scale-105 transition-all",
                step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <ChevronLeft size={28} className="text-[#64748B]" />
            </button>
            
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em]">Personalized Setup</span>
               <span className="text-base font-black text-[#0F172A] mt-1">{Math.round(progress)}% Complete</span>
            </div>

            <div className="w-14 h-14" /> {/* Spacer */}
          </div>
          
          <div className="w-full h-3 bg-white/50 backdrop-blur-md rounded-full overflow-hidden shadow-inner border border-white/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-[#0D9488] via-[#10B981] to-[#8B5CF6] relative shadow-[0_0_20px_rgba(13,148,136,0.5)]"
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Main Wizard Card */}
        <div className="w-full max-w-2xl flex-1 flex flex-col pb-32 relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Floating Nav Controls for Middle Steps */}
          {step > 1 && step < totalSteps && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-16 flex gap-4 sticky bottom-8 md:static"
            >
               <button 
                onClick={handlePaginatedBack}
                className="flex-1 py-5 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-2 border-white font-black text-[#64748B] hover:bg-white transition-all shadow-xl"
              >
                Back
              </button>
              <button 
                onClick={handlePaginatedNext}
                className="flex-[2] py-5 rounded-[2.5rem] bg-[#0D9488] text-white font-black hover:bg-[#0D9488]/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#0D9488]/20"
              >
                Continue
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
}
