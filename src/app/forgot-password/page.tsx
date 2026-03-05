"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-pjs text-[#0F172A]">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#0D9488]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#8B5CF6]/10 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <Link href="/login" className="inline-block">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 h-20 bg-[#0D9488]/10 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#0D9488]/10"
            >
              <Plus size={40} className="text-[#0D9488]" />
            </motion.div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">Reset Password</h1>
            <p className="text-[#64748B] font-bold text-sm uppercase tracking-widest">
              We'll send you a recovery link
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto text-[#10B981]">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black">Check your email</h3>
                <p className="text-sm font-bold text-[#64748B]">We've sent a password reset link to <span className="text-[#0F172A]">{email}</span></p>
              </div>
              <Link href="/login" className="block w-full bg-[#0D9488] text-white font-black py-5 rounded-2xl hover:bg-[#0D9488]/90 transition-all">
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
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

              {error && (
                <div className="bg-red-50 text-red-500 text-xs font-black px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D9488] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#0D9488]/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#0D9488]/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Send Recovery Link <ArrowRight size={20} /></>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="text-center mt-8">
              <Link href="/login" className="text-[#64748B] text-sm font-bold hover:text-[#0D9488]">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
