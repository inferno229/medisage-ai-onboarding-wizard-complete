-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age_group VARCHAR(50),
  gender VARCHAR(50),
  goals TEXT[],
  current_problems TEXT[],
  work_type VARCHAR(100),
  daily_steps_goal VARCHAR(50),
  diet VARCHAR(100),
  bedtime TIME,
  wakeup_time TIME,
  sleep_issue VARCHAR(100),
  conditions TEXT[],
  family_history TEXT[],
  ayurveda_enabled BOOLEAN DEFAULT true,
  yoga_enabled BOOLEAN DEFAULT true,
  reminder_style VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create medical_files table
CREATE TABLE IF NOT EXISTS public.medical_files (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  size VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water_ml INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  sunlight_checked BOOLEAN DEFAULT false,
  sleep_logged BOOLEAN DEFAULT false,
  wellness_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for medical_files
DROP POLICY IF EXISTS "Users can view own files" ON public.medical_files;
DROP POLICY IF EXISTS "Users can create own files" ON public.medical_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.medical_files;

CREATE POLICY "Users can view own files" ON public.medical_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own files" ON public.medical_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON public.medical_files
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can create own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;

CREATE POLICY "Users can view own logs" ON public.daily_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id);
