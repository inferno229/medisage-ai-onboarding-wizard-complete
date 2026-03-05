"use client";

import React from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  FileText,
  Search,
  ChevronRight,
  Shield,
  Activity,
  Stethoscope
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const caregivers = [
  { 
    id: 1, 
    name: "Dr. Emma Thompson", 
    specialty: "Primary Care Physician", 
    status: "Active Link",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    hospital: "Central Wellness Hospital"
  },
  { 
    id: 2, 
    name: "Dr. Marcus Chen", 
    specialty: "Cardiologist", 
    status: "View Only",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    hospital: "North Heart Institute"
  }
];

export default function CaregiverPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 selection:bg-[#0D9488]/20 px-4 md:px-0">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Caregiver Network</h1>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={16} className="text-[#0D9488]" />
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Secure Care Team Synchronization</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#0F172A] dark:bg-[#0D9488] text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-[#0F172A]/20 hover:scale-[1.02] transition-all text-sm">
          <UserPlus size={20} /> Link New Doctor
        </button>
      </header>

      <div className="space-y-10">
        {/* Active Caregivers */}
        <section className="space-y-4">
           <h2 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest ml-4">Authorized Providers</h2>
           <div className="grid grid-cols-1 gap-4">
              {caregivers.map((doc) => (
                <motion.div 
                  key={doc.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-[#E2E8F0] dark:border-white/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/5 overflow-hidden">
                       <img src={doc.avatar} alt={doc.name} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A] dark:text-white">{doc.name}</h3>
                      <p className="text-sm font-bold text-[#0D9488] flex items-center gap-2">
                        <Stethoscope size={14} /> {doc.specialty}
                      </p>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-2">{doc.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] hover:text-[#0D9488] hover:bg-white dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-2xl transition-all">
                      <MessageSquare size={20} />
                    </button>
                    <button className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] hover:text-[#0D9488] hover:bg-white dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-2xl transition-all">
                      <Calendar size={20} />
                    </button>
                    <div className="h-10 w-[1px] bg-[#F1F5F9] dark:bg-white/5 mx-2 hidden md:block" />
                    <button className="px-6 py-4 bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition-all">
                      Manage Access <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Access History */}
        <section className="space-y-4">
           <h2 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest ml-4">Recent Data Access</h2>
           <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] border border-[#E2E8F0] dark:border-white/5 overflow-hidden shadow-sm">
              {[
                { provider: "Dr. Emma Thompson", activity: "Viewed Blood Test Report", time: "2 hours ago", status: "Authorized" },
                { provider: "Central Wellness Lab", activity: "Uploaded Thyroid Profile", time: "Yesterday", status: "Secure Transfer" },
              ].map((log, i) => (
                <div key={i} className="p-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/5 last:border-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0D9488]/10 text-[#0D9488] rounded-xl flex items-center justify-center">
                       <FileText size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#0F172A] dark:text-white block">{log.provider}</span>
                      <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">{log.activity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest block">{log.time}</span>
                    <span className="text-[10px] font-bold text-[#10B981]">{log.status}</span>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Security Info */}
        <section className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield size={120} />
           </div>
           <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-[#0D9488] shrink-0">
              <Shield size={40} />
           </div>
           <div>
              <h4 className="text-lg font-black leading-tight">Your Data, Your Control</h4>
              <p className="text-xs font-bold text-white/40 mt-3 leading-relaxed">
                All caregivers must be manually authorized by you. You can revoke access to any file or health metric instantly. MediSage AI uses enterprise-grade AES-256 encryption.
              </p>
           </div>
        </section>
      </div>
    </div>
  );
}
