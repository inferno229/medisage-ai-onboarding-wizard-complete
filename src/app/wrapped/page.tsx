"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Droplets, 
  Moon, 
  Activity, 
  X, 
  Sparkles, 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHealth } from "@/context/HealthContext";

export default function WrappedPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const { stats } = useHealth();

  const slides = useMemo(() => [
    {
      id: 1,
      title: "Today's Wellness Recap 🎉",
      subtitle: `Your Score: ${stats.wellness_score}/100`,
      desc: stats.wellness_score >= 80 ? "You're in the elite zone! Keep up this incredible momentum." : "A solid start. Let's aim for 80+ tomorrow!",
      bg: "bg-[#0F172A]",
      color: "text-white",
      icon: Sparkles,
      iconColor: "text-orange-400"
    },
    {
      id: 2,
      title: "🏆 Hydration Check",
      highlight: stats.water_ml >= 2000 ? "Goal Master" : "Hydration Progress",
      desc: `You've logged ${stats.water_ml}ml of water today. ${stats.water_ml >= 2000 ? "Goal met!" : "Almost there!"}`,
      bg: "bg-blue-600",
      color: "text-white",
      icon: Droplets,
      iconColor: "text-blue-200"
    },
    {
      id: 3,
      title: "🏃 Activity Vitals",
      highlight: stats.steps >= 10000 ? "Step Hero" : "Keep Moving",
      desc: `You've taken ${stats.steps} steps so far. ${stats.steps >= 10000 ? "Incredible work!" : "A quick walk could boost your score."}`,
      bg: "bg-[#0D9488]",
      color: "text-white",
      icon: Activity,
      iconColor: "text-teal-200"
    },
    {
      id: 4,
      title: "📈 Rest & Sunlight",
      highlight: stats.sunlight_checked ? "Circadian Sync" : "Needs Sunlight",
      desc: stats.sunlight_checked ? "You got your morning light! Your biological clock is thankfull." : "Try to get some sunlight tomorrow morning for better sleep.",
      bg: "bg-[#8B5CF6]",
      color: "text-white",
      icon: Moon,
      iconColor: "text-purple-200"
    }
  ], [stats]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center font-pjs">
      {/* Progress Bars */}
      <div className="absolute top-6 inset-x-6 flex gap-2 z-[110]">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: i < currentSlide ? "100%" : i === currentSlide ? "100%" : "0%" }}
              transition={{ duration: i === currentSlide ? 5 : 0.3, ease: "linear" }}
              className="h-full bg-white"
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="absolute top-12 right-6 z-[110] w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
      >
        <X size={24} />
      </button>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "w-full h-full flex flex-col items-center justify-center p-10 text-center relative",
            slides[currentSlide].bg
          )}
        >
          <div className="relative z-10 max-w-lg space-y-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn("w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-10 shadow-2xl", slides[currentSlide].iconColor)}
            >
              {React.createElement(slides[currentSlide].icon, { size: 48 })}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{slides[currentSlide].title}</h2>
              {slides[currentSlide].highlight && (
                <h3 className="text-5xl font-black text-white leading-tight font-pjs tracking-tight">{slides[currentSlide].highlight}</h3>
              )}
              {slides[currentSlide].subtitle && (
                <h3 className="text-4xl font-black text-white leading-tight font-pjs tracking-tight">{slides[currentSlide].subtitle}</h3>
              )}
              <p className="text-lg font-medium text-white/80 max-w-sm mx-auto pt-4 leading-relaxed">
                {slides[currentSlide].desc}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Areas */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-[120] cursor-pointer" onClick={prev} />
      <div className="absolute inset-y-0 right-0 w-2/3 z-[120] cursor-pointer" onClick={next} />

      {/* Footer Hint */}
      <div className="absolute bottom-10 inset-x-0 text-center z-[130] pointer-events-none opacity-40">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Tap to navigate →</span>
      </div>
    </div>
  );
}
