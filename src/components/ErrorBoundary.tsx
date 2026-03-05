"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-red-100 m-4">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#0F172A]">Something went wrong</h2>
            <p className="text-[#64748B] font-medium max-w-sm mx-auto italic text-sm">
              "{this.state.error?.message || "An unexpected error occurred"}"
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0F172A]/20"
          >
            <RefreshCcw size={18} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
