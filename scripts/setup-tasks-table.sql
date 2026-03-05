-- Create tasks table for Routine & Planner
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  scheduled_date date NOT NULL,
  start_time time,
  end_time time,
  duration_minutes integer DEFAULT 0,
  reminder_minutes_before integer DEFAULT 0,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, scheduled_date);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to see only their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy to allow users to insert their own tasks
CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy to allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE tasks IS 'Stores user routine and planner tasks with time scheduling and reminders';
COMMENT ON COLUMN tasks.start_time IS 'Task start time in 24-hour format (e.g., 12:00)';
COMMENT ON COLUMN tasks.end_time IS 'Task end time in 24-hour format (e.g., 13:00)';
COMMENT ON COLUMN tasks.duration_minutes IS 'Auto-calculated duration in minutes';
COMMENT ON COLUMN tasks.reminder_minutes_before IS 'Minutes before start time to send reminder (0 = at start time)';
COMMENT ON COLUMN tasks.notes IS 'Optional additional notes for the task';
