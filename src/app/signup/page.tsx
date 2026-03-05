"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, Lock, User, ArrowRight, Loader2, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const AVATARS = [
  { id: "m1", name: "Male 1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" },
  { id: "m2", name: "Male 2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude" },
  { id: "f1", name: "Female 1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ariel" },
  { id: "f2", name: "Female 2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha" },
  { id: "em1", name: "Elderly Male", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=George" },
  { id: "ef1", name: "Elderly Female", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pat" },
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup(name, email, password, selectedAvatar);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-pjs">
      {/* Background Decor - More Colorful */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#0D9488]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#8B5CF6]/10 rounded-full blur-[120px] animate-pulse delay-700" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 bg-[#0D9488]/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#0D9488]/10"
          >
            <Plus size={32} className="text-[#0D9488]" />
          </motion.div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Join MediSage AI</h1>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSignup} className="space-y-8">
            {/* Avatar Selector */}
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Select Your Avatar</label>
              <div className="flex flex-wrap justify-center gap-4">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.url)}
                    className={cn(
                      "w-16 h-16 rounded-2xl p-1 transition-all relative overflow-hidden",
                      selectedAvatar === avatar.url 
                        ? "bg-[#0D9488] scale-110 shadow-lg shadow-[#0D9488]/20" 
                        : "bg-[#F1F5F9] hover:bg-[#E2E8F0]"
                    )}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover rounded-xl" />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-[#0D9488]/20 flex items-center justify-center">
                        <Check size={20} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-4">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white border-2 border-[#F1F5F9] rounded-2xl py-4 pl-14 pr-6 font-black text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-white border-2 border-[#F1F5F9] rounded-2xl py-4 pl-14 pr-6 font-black text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-4">Password</label>
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-4">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-[#64748B] text-sm font-bold">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0D9488] hover:underline">Login</Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
          By signing up, you agree to our Health Privacy Terms.
        </p>
      </motion.div>
    </div>
  );
}
