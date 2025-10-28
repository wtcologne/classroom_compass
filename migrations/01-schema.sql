-- Classroom Compass Database Schema
-- SQL-Schema für Supabase-Datenbank

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
-- Speichert Benutzerprofile mit Rollen und Punkten
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Methods Table
-- Speichert Unterrichtsmethoden mit Bewertungen
CREATE TABLE methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
-- Speichert Fragen aus dem "Frag die Crowd" Bereich
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers Table
-- Speichert Antworten auf Fragen
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
-- Speichert Kommentare und Bewertungen zu Methoden
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- Aktiviert RLS für alle Tabellen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Methods Policies
CREATE POLICY "Methods are viewable by everyone" ON methods
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert methods" ON methods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own methods" ON methods
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own methods" ON methods
  FOR DELETE USING (auth.uid() = author_id);

-- Questions Policies
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = author_id);

-- Answers Policies
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert answers" ON answers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own answers" ON answers
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own answers" ON answers
  FOR DELETE USING (auth.uid() = author_id);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Functions
-- Funktion zum automatischen Erstellen eines Profils bei Registrierung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische Profilerstellung
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Funktion zum Aktualisieren des updated_at Timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Timestamp-Updates
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_methods
  BEFORE UPDATE ON methods
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_questions
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_answers
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes für bessere Performance
CREATE INDEX idx_methods_category ON methods(category);
CREATE INDEX idx_methods_tags ON methods USING GIN(tags);
CREATE INDEX idx_methods_author ON methods(author_id);
CREATE INDEX idx_questions_author ON questions(author_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_author ON answers(author_id);
CREATE INDEX idx_comments_method ON comments(method_id);
CREATE INDEX idx_comments_author ON comments(author_id);
