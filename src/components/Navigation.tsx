"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  BarChart2, 
  FolderOpen, 
  Gift, 
  Settings, 
  Users,
  Search,
  BookOpen,
  Plus as PlusIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, color: "text-[#0F172A]", bg: "bg-[#0F172A]/10" },
  { name: "AI Copilot", href: "/chat", icon: MessageSquare, color: "text-[#0D9488]", bg: "bg-[#0D9488]/10" },
  { name: "Journal", href: "/journal", icon: BookOpen, color: "text-pink-500", bg: "bg-pink-500/10" },
  { name: "Routine", href: "/planner", icon: Calendar, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  { name: "Trackers", href: "/trackers", icon: BarChart2, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  { name: "Medical Vault", href: "/vault", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Weekly Wrapped", href: "/wrapped", icon: Gift, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Caregiver", href: "/caregiver", icon: Users, color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="hidden md:flex h-full w-72 flex-col bg-[#F8FAFC] dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] p-6 sticky top-0 overflow-y-auto selection:bg-[#0D9488]/20 font-pjs transition-colors duration-300">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
        <div className="w-11 h-11 rounded-[1.25rem] bg-[#0D9488] flex items-center justify-center text-white shadow-xl shadow-[#0D9488]/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
          <PlusIcon size={26} className="group-hover:rotate-90 transition-transform duration-700" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9] tracking-tighter leading-none">MediSage AI</span>
          <span className="text-[9px] font-black text-[#0D9488] uppercase tracking-[0.2em] mt-1">Elite Medical</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <div className="px-4 mb-6 flex items-center bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] group focus-within:border-[#0D9488]/30 focus-within:ring-4 focus-within:ring-[#0D9488]/5 transition-all">
          <Search size={16} className="text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" />
          <input 
            placeholder="Search health..." 
            className="w-full bg-transparent border-none focus:ring-0 py-3.5 px-3 text-xs font-bold placeholder-[#94A3B8] text-[#0F172A] dark:text-[#F1F5F9]"
          />
        </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-[#0D9488] text-white font-black shadow-lg shadow-[#0D9488]/20" 
                    : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
                )}
              >
                <Icon 
                  size={22} 
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#0D9488] dark:group-hover:text-[#0D9488]"
                  )} 
                />
                <span className={cn(
                  "text-sm tracking-tight font-bold",
                  isActive ? "text-white" : "text-[#64748B] dark:text-[#94A3B8]"
                )}>{item.name}</span>
              </Link>
            );
          })}

      </nav>

      
      {/* User Profile Card */}
      <div className="mt-8 pt-6 border-t border-[#F1F5F9] dark:border-[#334155]">
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-3xl border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3 group cursor-pointer hover:border-[#0D9488]/30 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-[#0F172A] dark:text-[#F1F5F9] truncate">{user?.name || "Felix Smith"}</span>
            <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">MD Candidate</span>
          </div>
          <Link href="/settings" className="ml-auto p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B]">
            <Settings size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  
  // Mobile only shows primary 5 items
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <nav className="glass rounded-[2rem] border border-white/20 shadow-2xl shadow-[#0F172A]/10 flex justify-around items-center h-20 px-4">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 transition-all duration-300 relative py-2",
                isActive ? "text-[#0D9488]" : "text-[#94A3B8]"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-1 w-12 h-12 bg-[#0D9488]/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
              <Icon 
                size={22} 
                className={cn(
                  "transition-all duration-300",
                  isActive ? "scale-110 mb-0.5" : "hover:text-[#0F172A]"
                )} 
              />
              <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
