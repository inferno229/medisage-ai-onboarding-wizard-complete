"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, avatar: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboarding: (completed: boolean) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    const metadata = supabaseUser.user_metadata ?? {};
    console.log("Mapping user:", supabaseUser.id, metadata);
    return {
      id: supabaseUser.id,
      name: metadata.name ?? supabaseUser.email?.split("@")[0] ?? "User",
      email: supabaseUser.email ?? "",
      avatar: metadata.avatar ?? DEFAULT_AVATAR,
      onboardingCompleted: Boolean(metadata.onboardingCompleted),
    };
  };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        console.warn("Initializing Auth context...");
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.error("Failed to load session", error);
        }
        console.log("Session loaded:", data.session ? "User found" : "No session");
        setUser(mapSupabaseUser(data.session?.user ?? null));
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session ? "User logged in" : "User logged out");
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && isPublicRoute) {
        if (user.onboardingCompleted) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    setUser(mapSupabaseUser(data.user));
  };

  const signup = async (name: string, email: string, password: string, avatar: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatar,
          onboardingCompleted: false,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user && !data.session) {
      // If session is null, it means email confirmation is likely required
      throw new Error("Verification email sent! Please confirm your email address to log in.");
    }

    if (data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Failed to sign out", error);
    }
    setUser(null);
    router.push("/login");
  };

  const updateOnboarding = async (completed: boolean) => {
    if (!user) return;
    const { data, error } = await supabase.auth.updateUser({
      data: {
        onboardingCompleted: completed,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    setUser(mapSupabaseUser(data.user));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateOnboarding, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
