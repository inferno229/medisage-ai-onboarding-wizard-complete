"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, BottomNav } from "./Navigation";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ErrorBoundary } from "./ErrorBoundary";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);
  const isOnboarding = pathname === "/onboarding";

  if (!mounted || loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0D9488] animate-spin" />
          <span className="text-sm font-black text-[#0D9488] animate-pulse uppercase tracking-[0.2em]">MediSage AI</span>
        </div>
      </div>
    );
  }

  // If on a public route, just show children
  if (isPublicRoute) {
    return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
  }

  // If not logged in and not on a public route, AuthProvider will redirect to /login
  if (!user) {
    return null; // Let AuthProvider handle redirect
  }

  // If logged in but onboarding not completed, redirect to /onboarding
  if (!user.onboardingCompleted && !isOnboarding) {
    router.push("/onboarding");
    return null;
  }

    const getPageStyles = () => {
      if (darkMode) {
        switch (pathname) {
          case "/dashboard": return "bg-[#0F172A]";
          case "/chat": return "bg-[#1E1B4B]";
          case "/trackers": return "bg-[#064E3B]";
          case "/vault": return "bg-[#1E293B]";
          case "/planner": return "bg-[#1E1B4B]";
          default: return "bg-[#0F172A]";
        }
      }
      switch (pathname) {
        case "/dashboard": return "bg-[#F0FDF9]"; // soft teal tint
        case "/chat": return "bg-[#F5F3FF]"; // soft lavender tint
        case "/trackers": return "bg-[#F0FDF4]"; // soft green tint
        case "/vault": return "bg-[#F8FAFC]"; // soft blue-grey tint
        case "/planner": return "bg-[#F5F3FF]"; // soft lavender tint
        default: return "bg-[#F8FAFC]";
      }
    };

    const getGradient = () => {
      if (pathname === "/dashboard") {
        return darkMode 
          ? "from-[#0F172A] via-[#1E293B] to-[#0F172A]" 
          : "from-[#F0FDF9] to-[#EEF2FF]";
      }
      return "";
    };


  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row selection:bg-[#0D9488]/20 selection:text-[#0D9488] transition-colors duration-300",
      getPageStyles()
    )}>
      {getGradient() && (
        <div className={cn("fixed inset-0 bg-gradient-to-br -z-10", getGradient())} />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <main className="flex-1 px-4 md:px-10 py-8 scroll-smooth relative z-10">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* Spacer for bottom nav on mobile */}
          <div className="h-24 md:hidden shrink-0" />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
