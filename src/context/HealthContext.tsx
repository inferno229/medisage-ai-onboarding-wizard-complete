"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { getISTDate } from "@/lib/dateUtils";

interface DailyStats {
  water_ml: number;
  steps: number;
  sunlight_checked: boolean;
  sleep_logged: boolean;
  wellness_score: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

interface HealthContextType {
  stats: DailyStats;
  tasks: Task[];
  loading: boolean;
  updateWater: (amount: number) => Promise<void>;
  updateSteps: (steps: number) => Promise<void>;
  toggleSunlight: () => Promise<void>;
  toggleSleep: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const INITIAL_STATS: DailyStats = {
  water_ml: 0,
  steps: 0,
  sunlight_checked: false,
  sleep_logged: false,
  wellness_score: 0,
};

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats>(INITIAL_STATS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateWellnessScore = useCallback((currentStats: DailyStats, currentTasks: Task[]) => {
    let score = 0;
    
    // Water goal met (+20 pts) - assuming 2000ml goal
    if (currentStats.water_ml >= 2000) score += 20;
    
    // Steps goal met (+20 pts) - assuming 10000 steps goal
    if (currentStats.steps >= 10000) score += 20;
    
    // Sleep logged (+20 pts)
    if (currentStats.sleep_logged) score += 20;
    
    // Sunlight checked (+10 pts)
    if (currentStats.sunlight_checked) score += 10;
    
    // Tasks % * 30 pts
    if (currentTasks.length > 0) {
      const completedCount = currentTasks.filter(t => t.completed).length;
      score += Math.round((completedCount / currentTasks.length) * 30);
    }
    
    return Math.min(score, 100);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    const today = getISTDate();
    
    try {
      // Fetch daily log
      const { data: logData, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      let currentStats = INITIAL_STATS;
      if (logData) {
        currentStats = {
          water_ml: logData.water_ml,
          steps: logData.steps,
          sunlight_checked: logData.sunlight_checked,
          sleep_logged: logData.sleep_logged,
          wellness_score: logData.wellness_score,
        };
      } else {
        // New user or new day, create record
        const { data: newLog, error: createError } = await supabase
          .from('daily_logs')
          .insert({ user_id: user.id, date: today })
          .select()
          .single();
        
        if (newLog) {
            currentStats = {
                water_ml: newLog.water_ml,
                steps: newLog.steps,
                sunlight_checked: newLog.sunlight_checked,
                sleep_logged: newLog.sleep_logged,
                wellness_score: newLog.wellness_score,
            };
        }
      }

      // Fetch tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today);

      const currentTasks = taskData || [];
      
      setStats(currentStats);
      setTasks(currentTasks);
      
      // Recalculate score if needed (maybe it wasn't saved correctly)
      const newScore = calculateWellnessScore(currentStats, currentTasks);
      if (newScore !== currentStats.wellness_score) {
          await supabase
            .from('daily_logs')
            .update({ wellness_score: newScore })
            .eq('user_id', user.id)
            .eq('date', today);
          setStats(prev => ({ ...prev, wellness_score: newScore }));
      }

    } catch (err) {
      console.error("Error fetching health data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, calculateWellnessScore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateLog = async (updates: Partial<DailyStats>) => {
    if (!user) return;
    const today = getISTDate();
    
    const newStats = { ...stats, ...updates };
    const newScore = calculateWellnessScore(newStats, tasks);
    
    const { error } = await supabase
      .from('daily_logs')
      .update({ ...updates, wellness_score: newScore })
      .eq('user_id', user.id)
      .eq('date', today);
    
    if (!error) {
      setStats({ ...newStats, wellness_score: newScore });
    }
  };

  const updateWater = async (amount: number) => {
    await updateLog({ water_ml: amount });
  };

  const updateSteps = async (steps: number) => {
    await updateLog({ steps });
  };

  const toggleSunlight = async () => {
    await updateLog({ sunlight_checked: !stats.sunlight_checked });
  };

  const toggleSleep = async () => {
    await updateLog({ sleep_logged: !stats.sleep_logged });
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId);
    
    if (!error) {
      const newTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      setTasks(newTasks);
      
      // Update wellness score
      const newScore = calculateWellnessScore(stats, newTasks);
      const today = getISTDate();
      await supabase
        .from('daily_logs')
        .update({ wellness_score: newScore })
        .eq('user_id', user.id)
        .eq('date', today);
      setStats(prev => ({ ...prev, wellness_score: newScore }));
    }
  };

  return (
    <HealthContext.Provider value={{ 
        stats, 
        tasks, 
        loading, 
        updateWater, 
        updateSteps, 
        toggleSunlight, 
        toggleSleep, 
        toggleTask,
        refreshData: fetchData
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};
