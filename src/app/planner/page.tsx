"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Check, 
  Play, 
  Pause, 
  Square,
  Calendar as CalendarIcon,
  Timer,
  Bell,
    MoreVertical,
    Trash2,
    X,
    Zap
  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { supabase } from "@/lib/supabaseClient";
import { getISTDate } from "@/lib/dateUtils";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";

export default function PlannerPage() {
  const { user } = useAuth();
  const { refreshData } = useHealth();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(getISTDate());
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [timeError, setTimeError] = useState("");
  const [isAdding, setIsSaving] = useState(false);

  const fetchTasks = useCallback(async (date: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', date)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate, fetchTasks]);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', id);
      
      if (!error) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
        refreshData(); // Update global wellness score
      }
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    if (!validateTimes()) return;

    setIsSaving(true);
    try {
      const durationMin = startTime && endTime ? timeToMinutes(endTime) - timeToMinutes(startTime) : 0;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: newTaskTitle,
          scheduled_date: selectedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          duration_minutes: durationMin > 0 ? durationMin : null,
          reminder_minutes_before: reminderMinutes,
          notes: notes || null,
          completed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setTasks(prev => [...prev, data]);
        
        // Schedule notification if reminder is set
        if (startTime && reminderMinutes >= 0) {
          const [timePart, period] = startTime.split(' ');
          const [hours, minutes] = timePart.split(':').map(Number);
          let notifyHours = hours;
          if (period === 'PM' && hours !== 12) notifyHours += 12;
          if (period === 'AM' && hours === 12) notifyHours = 0;
          
          const notifyDate = new Date(selectedDate);
          notifyDate.setHours(notifyHours, minutes - reminderMinutes, 0);
          
          await scheduleNotification(`Reminder: ${newTaskTitle}`, notifyDate);
        }

        // Reset form and close modal
        setNewTaskTitle("");
        setStartTime("");
        setEndTime("");
        setNotes("");
        setReminderMinutes(0);
        setTimeError("");
        setShowAddModal(false);
        
        // Show success message
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Task created!', {
            body: `${newTaskTitle} has been added to your routine.`,
            icon: '/icon.png',
          });
        }
        
        refreshData();
      }
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) {
        setTasks(prev => prev.filter(t => t.id !== id));
        refreshData();
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Helper function to convert 12-hour time to minutes since midnight
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };

  // Helper function to convert minutes since midnight to 12-hour time
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate duration between start and end time
  const calculateDuration = (): string => {
    if (!startTime || !endTime) return "";
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    
    if (endMin <= startMin) return "";
    
    const durationMin = endMin - startMin;
    if (durationMin < 60) {
      return `${durationMin} mins`;
    }
    const hours = Math.floor(durationMin / 60);
    const remainingMins = durationMin % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Validate end time is after start time
  const validateTimes = (): boolean => {
    if (!startTime || !endTime) {
      setTimeError("");
      return true;
    }
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) {
      setTimeError("End time must be after start time");
      return false;
    }
    setTimeError("");
    return true;
  };

  // Request notification permission and schedule notification
  const scheduleNotification = async (title: string, scheduledTime: Date) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        // Calculate time until notification
        const now = new Date();
        const delay = scheduledTime.getTime() - now.getTime();
        if (delay > 0) {
          setTimeout(() => {
            new Notification(title, {
              icon: '/icon.png',
              badge: '/icon.png',
            });
          }, delay);
        }
      } else if (Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="max-w-4xl mx-auto pb-20 selection:bg-[#0D9488]/20 px-4 md:px-0">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight">Routine & Planner</h1>
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Design your perfect day</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-[#0F172A] dark:bg-[#0D9488] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#0F172A]/20 hover:scale-110 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Weekly Calendar Strip */}
      <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-2xl shadow-slate-200/50 mb-10">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="p-2 hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] rounded-xl transition-colors text-[#94A3B8]">
                <ChevronLeft size={20} />
            </button>
            <span className="font-black text-[#0F172A] dark:text-white text-sm">{format(currentWeekStart, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="p-2 hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A] rounded-xl transition-colors text-[#94A3B8]">
                <ChevronRight size={20} />
            </button>
        </div>
        <div className="flex justify-between items-center gap-2 overflow-x-auto scrollbar-hide">
          {weekDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isToday = getISTDate() === dateStr;
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 px-5 rounded-[2rem] transition-all min-w-[64px]",
                  isSelected 
                    ? "bg-[#0F172A] dark:bg-[#0D9488] text-white shadow-xl scale-110" 
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{format(date, 'EEE')}</span>
                <span className="text-lg font-black">{format(date, 'd')}</span>
                {isToday && !isSelected && (
                   <div className="w-1.5 h-1.5 bg-[#0D9488] rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#0F172A] dark:text-white font-pjs tracking-tight flex items-center gap-2 ml-2">
          <CalendarIcon size={20} className="text-[#0D9488]" />
          {selectedDate === getISTDate() ? "Today's Schedule" : `Schedule for ${format(new Date(selectedDate), 'MMM d')}`}
        </h2>
        
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D9488]"></div>
            </div>
        ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-[#1E293B]/40 rounded-[3rem] border border-dashed border-[#E2E8F0] dark:border-white/10">
                <p className="text-[#94A3B8] font-bold">No tasks scheduled for this day.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-[#0D9488] font-black text-sm uppercase tracking-widest hover:underline">Add First Task</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
                <motion.div
                layout
                key={task.id}
                className={cn(
                    "group relative bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm flex items-center justify-between transition-all hover:shadow-xl hover:shadow-[#0D9488]/5",
                    task.completed && "opacity-60 grayscale-[0.5]"
                )}
                >
                <div className="flex items-center gap-6">
                    <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={cn(
                        "w-12 h-12 rounded-[1.25rem] border-2 flex items-center justify-center transition-all",
                        task.completed ? "bg-[#10B981] border-[#10B981]" : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-white/10 hover:border-[#0D9488]"
                    )}
                    >
                    {task.completed && <Check size={20} className="text-white" />}
                    </button>
                    <div>
                    <h3 className={cn("font-black text-[#0F172A] dark:text-white transition-all", task.completed && "line-through text-[#94A3B8]")}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {task.start_time && task.end_time && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488]">
                            <Clock size={12} />
                            {task.start_time} → {task.end_time} {task.duration_minutes && `(${Math.floor(task.duration_minutes / 60) > 0 ? Math.floor(task.duration_minutes / 60) + 'h ' : ''}${task.duration_minutes % 60 > 0 ? (task.duration_minutes % 60) + 'm' : ''})`}
                          </div>
                        )}
                        {task.notes && (
                          <div className="text-[10px] font-semibold text-[#94A3B8] px-2 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-lg">
                            {task.notes.substring(0, 20)}...
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                        <Clock size={12} /> Scheduled
                        </div>
                    </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => deleteTask(task.id)} className="w-10 h-10 bg-[#FF5C5C]/5 text-[#FF5C5C] rounded-xl flex items-center justify-center hover:bg-[#FF5C5C] hover:text-white transition-all">
                    <Trash2 size={16} />
                    </button>
                </div>
                </motion.div>
            ))}
            </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-3rem)] max-w-md bg-white dark:bg-[#1E293B] p-10 rounded-[3rem] shadow-2xl z-[70]"
            >
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-white mb-8">New Task</h3>
              <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Morning Meditation" 
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all dark:text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Date</label>
                    <div className="flex items-center gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-sm dark:text-white">
                      <CalendarIcon size={16} className="text-[#94A3B8]" /> {format(new Date(selectedDate), 'MMM d')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Type</label>
                    <div className="flex items-center gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-sm dark:text-white">
                      <Zap size={16} className="text-[#94A3B8]" /> Routine
                    </div>
                  </div>
                </div>

                {/* Start Time & End Time */}
                <div className="space-y-3 p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/5 rounded-2xl">
                  <h4 className="text-xs font-black text-[#0D9488] uppercase tracking-widest">⏰ Start Time & End Time</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Start Time</label>
                      <input 
                        type="time" 
                        value={startTime ? startTime.split(' ')[0] : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const hour = parseInt(h);
                            const period = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                            setStartTime(`${displayHour.toString().padStart(2, '0')}:${m} ${period}`);
                          } else {
                            setStartTime("");
                          }
                          validateTimes();
                        }}
                        className="w-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all dark:text-white"
                      />
                      {startTime && (
                        <div className="text-[9px] font-bold text-[#0D9488] ml-1">{startTime}</div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">End Time</label>
                      <input 
                        type="time" 
                        value={endTime ? endTime.split(' ')[0] : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const hour = parseInt(h);
                            const period = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                            setEndTime(`${displayHour.toString().padStart(2, '0')}:${m} ${period}`);
                          } else {
                            setEndTime("");
                          }
                          validateTimes();
                        }}
                        className="w-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all dark:text-white"
                      />
                      {endTime && (
                        <div className="text-[9px] font-bold text-[#0D9488] ml-1">{endTime}</div>
                      )}
                    </div>
                  </div>
                  {timeError && (
                    <div className="text-xs font-bold text-[#FF5C5C] bg-[#FF5C5C]/5 px-3 py-2 rounded-lg ml-1">
                      {timeError}
                    </div>
                  )}
                  {calculateDuration() && (
                    <div className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/5 px-3 py-2 rounded-lg ml-1">
                      ⏱ Duration: {calculateDuration()}
                    </div>
                  )}
                </div>

                {/* Reminder Options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">🔔 Reminder</label>
                  <select 
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all dark:text-white"
                  >
                    <option value={0}>At start time</option>
                    <option value={5}>5 mins before</option>
                    <option value={10}>10 mins before</option>
                    <option value={15}>15 mins before</option>
                    <option value={30}>30 mins before</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">📝 Notes (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any extra details..." 
                    rows={3}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#F1F5F9] dark:border-white/5 rounded-2xl px-5 py-4 font-medium focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all dark:text-white resize-none"
                  />
                </div>

                <button 
                  onClick={addTask}
                  disabled={isAdding || !newTaskTitle.trim()}
                  className="w-full py-5 bg-[#0D9488] text-white rounded-[2rem] font-black shadow-xl shadow-[#0D9488]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  {isAdding ? "Creating..." : "Create Task"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
