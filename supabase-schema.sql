-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('study', 'review', 'practice', 'project')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_study_sessions_user_date ON study_sessions(user_id, date DESC);
CREATE INDEX idx_study_sessions_user_subject ON study_sessions(user_id, subject_id);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'exam', 'lab', 'project', 'reading')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Subjects table (user-customizable)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'BookOpen',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_topics INTEGER DEFAULT 0,
  completed_topics INTEGER DEFAULT 0,
  semester INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_user ON subjects(user_id);

-- Streak data table
CREATE TABLE streak_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  weekly_goal INTEGER DEFAULT 10,
  weekly_progress DECIMAL(5,2) DEFAULT 0,
  last_study_date DATE,
  heatmap_data JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz scores table
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_scores_user_date ON quiz_scores(user_id, date DESC);

-- Library materials (shared, not user-specific)
CREATE TABLE library_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('notes', 'papers', 'summary', 'guide')),
  semester INTEGER,
  pages INTEGER,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can manage their own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streak data" ON streak_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quiz scores" ON quiz_scores
  FOR ALL USING (auth.uid() = user_id);

-- Library materials are readable by all authenticated users
ALTER TABLE library_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read library materials" ON library_materials
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to auto-create streak_data on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO streak_data (user_id, current_streak, longest_streak, total_days, weekly_goal, weekly_progress, heatmap_data)
  VALUES (NEW.id, 0, 0, 0, 10, 0, '[]'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-create default subjects for new users
CREATE OR REPLACE FUNCTION create_default_subjects()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subjects (user_id, name, code, color, icon, progress, total_topics, completed_topics, semester) VALUES
    (NEW.id, 'Data Structures', 'DS201', '#3B82F6', 'Database', 0, 12, 0, 3),
    (NEW.id, 'Operating Systems', 'OS301', '#8B5CF6', 'Cpu', 0, 10, 0, 3),
    (NEW.id, 'Computer Networks', 'CN302', '#10B981', 'Globe', 0, 14, 0, 4),
    (NEW.id, 'Database Systems', 'DB303', '#F59E0B', 'Server', 0, 11, 0, 4),
    (NEW.id, 'Software Engineering', 'SE401', '#EF4444', 'GitBranch', 0, 15, 0, 5),
    (NEW.id, 'Web Development', 'WD402', '#EC4899', 'Code', 0, 13, 0, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_subjects
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subjects();