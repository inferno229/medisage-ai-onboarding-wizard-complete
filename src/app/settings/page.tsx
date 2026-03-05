"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Leaf, 
  Wind, 
  Info, 
  ShieldAlert, 
  LogOut, 
  ChevronRight, 
  Mail, 
  Lock, 
  Smartphone, 
  Globe, 
  Trash2,
  Activity,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

  export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [ayurveda, setAyurveda] = useState(true);
    const [yoga, setYoga] = useState(true);
    const [notifications, setNotifications] = useState(true);
  
    const resetOnboarding = () => {
      router.push("/onboarding");
    };
  
    if (!user) return null;
  
  return (
    <div className="max-w-4xl mx-auto pb-20 selection:bg-[#0D9488]/20 px-4 md:px-0">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Caregiver & Settings</h1>
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Personalize your healthcare experience</p>
      </header>

      <div className="space-y-10">
        {/* Profile Section */}
        <section className="bg-white dark:bg-[#1E293B] rounded-[3rem] p-10 border border-[#E2E8F0] dark:border-white/5 shadow-sm flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[3.5rem] bg-[#F1F5F9] dark:bg-[#0F172A] border-4 border-white dark:border-white/10 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
               <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User Avatar" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0F172A] dark:bg-[#0D9488] text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-white/10 hover:scale-110 active:scale-90 transition-all">
               <User size={18} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-white font-pjs">{user.name}</h2>
              <p className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8] mt-1 italic">Personal Medical ID: MS-9823-AI</p>
            </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
             <div className="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <Activity size={12} /> Standard Profile
             </div>
             <div className="bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <Award size={12} /> Pro Member
             </div>
          </div>
          <button 
            onClick={resetOnboarding}
            className="text-xs font-black text-[#0D9488] uppercase tracking-widest hover:underline transition-all"
          >
            Re-run Health Setup & Wizard
          </button>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preferences */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest ml-4">Preferences</h3>
          <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] border border-[#E2E8F0] dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/5 group cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Leaf size={20} />
                </div>
                <span className="text-sm font-black text-[#0F172A] dark:text-white">Ayurveda Tips</span>
              </div>
              <button 
                onClick={() => setAyurveda(!ayurveda)}
                className={cn("w-10 h-5 rounded-full transition-all relative", ayurveda ? "bg-[#10B981]" : "bg-[#E2E8F0] dark:bg-[#0F172A]")}
              >
                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", ayurveda ? "right-1" : "left-1")} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/5 group cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                  <Wind size={20} />
                </div>
                <span className="text-sm font-black text-[#0F172A] dark:text-white">Yoga Recommendations</span>
              </div>
              <button 
                onClick={() => setYoga(!yoga)}
                className={cn("w-10 h-5 rounded-full transition-all relative", yoga ? "bg-[#8B5CF6]" : "bg-[#E2E8F0] dark:bg-[#0F172A]")}
              >
                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", yoga ? "right-1" : "left-1")} />
              </button>
            </div>
              <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 dark:bg-white/10 flex items-center justify-center text-[#0F172A] dark:text-white">
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <span className="text-sm font-black text-[#0F172A] dark:text-white">Dark Mode</span>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={cn("w-10 h-5 rounded-full transition-all relative", darkMode ? "bg-[#0D9488]" : "bg-[#E2E8F0] dark:bg-[#0F172A]")}
                >
                  <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", darkMode ? "right-1" : "left-1")} />
                </button>
              </div>
          </div>
        </section>

        {/* Account & Privacy */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest ml-4">System</h3>
          <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] border border-[#E2E8F0] dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/5 group cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Bell size={20} />
                </div>
                <span className="text-sm font-black text-[#0F172A] dark:text-white">Notifications</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn("w-10 h-5 rounded-full transition-all relative", notifications ? "bg-orange-500" : "bg-[#E2E8F0] dark:bg-[#0F172A]")}
              >
                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", notifications ? "right-1" : "left-1")} />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/5 group cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Globe size={20} />
                </div>
                <span className="text-sm font-black text-[#0F172A] dark:text-white">Language</span>
              </div>
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">English</span>
            </div>
            <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={20} />
                </div>
                <span className="text-sm font-black text-red-500">Delete My Data</span>
              </div>
              <ChevronRight size={18} className="text-red-500/40" />
            </div>
          </div>
        </section>
      </div>


        {/* Disclaimer */}
        <section className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldAlert size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#FF5C5C]/20 flex items-center justify-center text-[#FF5C5C] shrink-0">
               <ShieldAlert size={40} />
            </div>
            <div>
              <h4 className="text-lg font-black leading-tight">About MediSage AI</h4>
              <p className="text-xs font-bold text-white/40 mt-3 leading-relaxed">
                MediSage AI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Version 2.4.0 Build Stable</span>
               <button 
                 onClick={logout}
                 className="flex items-center gap-2 text-xs font-black text-white hover:text-[#0D9488] transition-colors"
                >
                 <LogOut size={16} /> Sign Out Account
               </button>
            </div>

        </section>
      </div>
    </div>
  );
}
