"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  MoreVertical, 
  Upload, 
  ShieldCheck, 
  Link as LinkIcon, 
  Sparkles, 
  X, 
  Activity, 
  Stethoscope, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  FileDigit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function VaultPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Fetch files error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          ageGroup: data.age_group,
          gender: data.gender,
          goals: data.goals,
          currentProblems: data.current_problems,
          medicalHistory: data.conditions
        });
      }
    };
    loadProfile();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('medical_reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical_reports')
        .getPublicUrl(filePath);

      // 3. Save to Table
      const { data, error: dbError } = await supabase
        .from('medical_files')
        .insert({
          user_id: user.id,
          name: file.name,
          file_url: publicUrl,
          file_type: file.type.includes('pdf') ? 'PDF' : 'Image',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (data) setFiles(prev => [data, ...prev]);

    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      // Extract path from URL
      const path = url.split('medical_reports/')[1];
      if (path) {
        await supabase.storage.from('medical_reports').remove([path]);
      }
      await supabase.from('medical_files').delete().eq('id', id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startAnalysis = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    setExplainingId(id);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.file_type,
          profile
        })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 selection:bg-[#0D9488]/20 px-4 md:px-0">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Medical File Vault</h1>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={16} className="text-[#0D9488]" />
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">End-to-End Encrypted Storage</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#0F172A] dark:bg-[#0D9488] text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-[#0F172A]/20 hover:scale-[1.02] transition-all text-sm disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </header>

      {/* Drag & Drop Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="bg-white/40 dark:bg-[#1E293B]/40 backdrop-blur-xl border-4 border-dashed border-[#E2E8F0] dark:border-white/10 rounded-[3rem] p-8 md:p-12 text-center mb-10 group hover:border-[#0D9488]/30 hover:bg-white/60 transition-all cursor-pointer"
      >
        <div className="w-16 h-16 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#94A3B8] mx-auto mb-6 group-hover:scale-110 group-hover:text-[#0D9488] transition-all shadow-sm">
          {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
        </div>
        <h3 className="text-xl font-black text-[#0F172A] dark:text-white">{uploading ? "Uploading report..." : "Drop Files and Prescription here"}</h3>
        <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mt-2">Supports PDF, PNG, and JPG up to 10MB</p>
      </div>

      {/* File List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight flex items-center gap-2 ml-2">
            <FileDigit size={20} className="text-[#0D9488]" />
            Your Medical Records
        </h2>

        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-[#0D9488]" />
            </div>
        ) : files.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-[#1E293B]/40 rounded-[3rem] border border-dashed border-[#E2E8F0] dark:border-white/10">
                <p className="text-[#94A3B8] font-bold">No files uploaded yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {files.map((file) => (
                    <motion.div 
                        key={file.id} 
                        layout
                        className="group relative bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-6 border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-[#0D9488]/5 transition-all flex flex-col items-center text-center"
                    >
                        <button 
                            onClick={() => deleteFile(file.id, file.file_url)}
                            className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#FF5C5C] opacity-0 group-hover:opacity-100 transition-all p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                        
                        <div className={cn(
                            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3",
                            file.file_type === "PDF" ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                        )}>
                            {file.file_type === "PDF" ? <FileText size={32} /> : <ImageIcon size={32} />}
                        </div>

                        <h4 className="font-black text-[#0F172A] dark:text-white text-sm leading-tight mb-2 px-2 line-clamp-2">{file.name}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] font-black text-[#94A3B8]">•</span>
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{file.size}</span>
                        </div>
                        
                        <div className="mt-6 flex flex-col w-full gap-2">
                            <button 
                                onClick={() => startAnalysis(file.id)}
                                className="w-full py-3.5 bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0D9488] hover:text-white transition-all"
                            >
                                <Sparkles size={14} /> Explain with AI ✨
                            </button>
                            <a 
                                href={file.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-transparent text-[#94A3B8] hover:text-[#0D9488] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                <LinkIcon size={14} /> View Original
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      {/* AI Explanation Modal */}
      <AnimatePresence>
        {explainingId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExplainingId(null)}
              className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl bg-white dark:bg-[#1E293B] p-6 md:p-14 rounded-[3rem] shadow-2xl z-[90] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setExplainingId(null)}
                className="absolute top-8 right-8 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 text-center">
                  <div className="relative w-32 h-32">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-dashed border-[#0D9488]/30 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[#0D9488]">
                      <Sparkles size={48} className="animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] dark:text-white">Analyzing your report...</h3>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">Connecting with medical research engines.</p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-10">
                  <div className="flex items-center gap-6 pb-10 border-b border-[#F1F5F9] dark:border-white/5">
                    <div className="w-16 h-16 bg-[#0D9488]/10 rounded-[1.5rem] flex items-center justify-center text-[#0D9488]">
                      <Stethoscope size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">Report Breakdown</h3>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">MediSage Intel Engine Analysis</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0F172A]/40 border border-[#E2E8F0] dark:border-white/5 rounded-[2rem] space-y-4">
                      <p className="text-sm font-black text-[#0F172A] dark:text-white mb-4 leading-relaxed">{analysisResult.summary}</p>
                      {analysisResult.findings && analysisResult.findings.map((finding: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             finding.status === "normal" ? "bg-[#10B981]" : 
                             finding.status === "critical" ? "bg-[#FF5C5C]" : "bg-orange-500"
                           )} />
                           <span className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">{finding.label}: {finding.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#0D9488]/5 border border-[#0D9488]/10 p-6 rounded-[2rem] space-y-4">
                       <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Actionable Insights</span>
                       <ul className="space-y-3">
                         {analysisResult.insights && analysisResult.insights.map((insight: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                             <div className="w-6 h-6 rounded-full bg-white dark:bg-[#0D9488] flex items-center justify-center text-[#0D9488] dark:text-white shadow-sm shrink-0"><CheckCircle2 size={12} /></div>
                             <span className="mt-1">{insight}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {analysisResult.actions && analysisResult.actions.map((action: any, i: number) => (
                       <button key={i} className="py-4 bg-[#0F172A] dark:bg-[#0D9488] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#0F172A]/90 transition-all">
                          {action.label} <ArrowRight size={14} />
                       </button>
                     ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <AlertTriangle className="mx-auto text-orange-500" size={48} />
                  <p className="font-black text-[#0F172A] dark:text-white">Something went wrong with the analysis.</p>
                  <button onClick={() => setExplainingId(null)} className="text-xs font-black text-[#0D9488] uppercase">Close</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
