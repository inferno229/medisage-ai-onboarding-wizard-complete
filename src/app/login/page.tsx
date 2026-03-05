"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-pjs">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#0D9488]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#8B5CF6]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-20 h-20 bg-[#0D9488]/10 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#0D9488]/10"
          >
            <Plus size={40} className="text-[#0D9488]" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">MediSage AI</h1>
            <p className="text-[#64748B] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-[#0D9488]" />
              Your Personal AI Health Copilot
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50 space-y-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border-2 border-[#F1F5F9] rounded-2xl py-4 pl-14 pr-6 font-black text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Password</label>
                    <Link href="/forgot-password" className="text-[10px] font-black text-[#0D9488] uppercase tracking-[0.1em] hover:underline">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-[#F1F5F9] rounded-2xl py-4 pl-14 pr-6 font-black text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-500 text-xs font-black px-4 py-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D9488] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#0D9488]/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#0D9488]/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Login <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[#64748B] text-sm font-bold">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#0D9488] hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
          MediSage AI © 2024 • Secured by Healthcare Encryption
        </p>
      </motion.div>
    </div>
  );
}
