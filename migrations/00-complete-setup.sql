-- ============================================================================
-- CLASSROOM COMPASS - COMPLETE DATABASE SETUP
-- ============================================================================
-- Diese Datei enthält alle SQL-Befehle um die komplette Datenbank aufzusetzen
-- Führe diese Datei aus, wenn du die Datenbank von Grund auf neu erstellen willst
-- ============================================================================

-- ============================================================================
-- 1. BASIC SCHEMA (supabase-schema.sql)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
-- Speichert Benutzerprofile mit Rollen und Punkten
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS methods (
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
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers Table
-- Speichert Antworten auf Fragen
CREATE TABLE IF NOT EXISTS answers (
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
CREATE TABLE IF NOT EXISTS comments (
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
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Methods Policies
DROP POLICY IF EXISTS "Methods are viewable by everyone" ON methods;
CREATE POLICY "Methods are viewable by everyone" ON methods
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert methods" ON methods;
CREATE POLICY "Authenticated users can insert methods" ON methods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own methods" ON methods;
CREATE POLICY "Users can update their own methods" ON methods
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own methods" ON methods;
CREATE POLICY "Users can delete their own methods" ON methods
  FOR DELETE USING (auth.uid() = author_id);

-- Questions Policies
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON questions;
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert questions" ON questions;
CREATE POLICY "Authenticated users can insert questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own questions" ON questions;
CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own questions" ON questions;
CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = author_id);

-- Answers Policies
DROP POLICY IF EXISTS "Answers are viewable by everyone" ON answers;
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert answers" ON answers;
CREATE POLICY "Authenticated users can insert answers" ON answers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
CREATE POLICY "Users can update their own answers" ON answers
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;
CREATE POLICY "Users can delete their own answers" ON answers
  FOR DELETE USING (auth.uid() = author_id);

-- Comments Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_methods ON methods;
CREATE TRIGGER handle_updated_at_methods
  BEFORE UPDATE ON methods
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_questions ON questions;
CREATE TRIGGER handle_updated_at_questions
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_answers ON answers;
CREATE TRIGGER handle_updated_at_answers
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_comments ON comments;
CREATE TRIGGER handle_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_methods_category ON methods(category);
CREATE INDEX IF NOT EXISTS idx_methods_tags ON methods USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_methods_author ON methods(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_method ON comments(method_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- ============================================================================
-- 2. INTERACTIONS (supabase-add-interactions.sql)
-- ============================================================================

-- Question Upvotes Table
CREATE TABLE IF NOT EXISTS question_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- Answer Upvotes Table  
CREATE TABLE IF NOT EXISTS answer_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- Method Ratings Table
CREATE TABLE IF NOT EXISTS method_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(method_id, user_id)
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_question_upvotes_question ON question_upvotes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_user ON question_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_answer ON answer_upvotes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_user ON answer_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_method ON method_ratings(method_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_user ON method_ratings(user_id);

-- RLS Policies
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE method_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view question upvotes" ON question_upvotes;
CREATE POLICY "Anyone can view question upvotes" ON question_upvotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add their own upvotes" ON question_upvotes;
CREATE POLICY "Users can add their own upvotes" ON question_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own upvotes" ON question_upvotes;
CREATE POLICY "Users can remove their own upvotes" ON question_upvotes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view answer upvotes" ON answer_upvotes;
CREATE POLICY "Anyone can view answer upvotes" ON answer_upvotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add their own answer upvotes" ON answer_upvotes;
CREATE POLICY "Users can add their own answer upvotes" ON answer_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own answer upvotes" ON answer_upvotes;
CREATE POLICY "Users can remove their own answer upvotes" ON answer_upvotes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view method ratings" ON method_ratings;
CREATE POLICY "Anyone can view method ratings" ON method_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add their own ratings" ON method_ratings;
CREATE POLICY "Users can add their own ratings" ON method_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON method_ratings;
CREATE POLICY "Users can update their own ratings" ON method_ratings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON method_ratings;
CREATE POLICY "Users can delete their own ratings" ON method_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger für updated_at bei method_ratings
DROP TRIGGER IF EXISTS handle_updated_at_method_ratings ON method_ratings;
CREATE TRIGGER handle_updated_at_method_ratings
  BEFORE UPDATE ON method_ratings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Funktionen für Upvote-Zählung
CREATE OR REPLACE FUNCTION update_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions SET upvotes = upvotes + 1 WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_question_upvotes_trigger ON question_upvotes;
CREATE TRIGGER update_question_upvotes_trigger
  AFTER INSERT OR DELETE ON question_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_question_upvotes();

CREATE OR REPLACE FUNCTION update_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE answers SET upvotes = upvotes + 1 WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE answers SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.answer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_answer_upvotes_trigger ON answer_upvotes;
CREATE TRIGGER update_answer_upvotes_trigger
  AFTER INSERT OR DELETE ON answer_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_answer_upvotes();

-- Funktionen für Method Rating Updates
CREATE OR REPLACE FUNCTION update_method_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_cnt INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(3,2), 0.00),
    COUNT(*)
  INTO avg_rating, rating_cnt
  FROM method_ratings
  WHERE method_id = COALESCE(NEW.method_id, OLD.method_id);
  
  UPDATE methods
  SET 
    rating = avg_rating,
    rating_count = rating_cnt
  WHERE id = COALESCE(NEW.method_id, OLD.method_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_method_rating_trigger ON method_ratings;
CREATE TRIGGER update_method_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON method_ratings
  FOR EACH ROW EXECUTE FUNCTION update_method_rating();

-- ============================================================================
-- 3. FAVORITES (supabase-add-favorites.sql)
-- ============================================================================

-- Question Favorites Table
CREATE TABLE IF NOT EXISTS question_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Method Favorites Table
CREATE TABLE IF NOT EXISTS method_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, method_id)
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_question_favorites_user ON question_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_question_favorites_question ON question_favorites(question_id);
CREATE INDEX IF NOT EXISTS idx_method_favorites_user ON method_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_method_favorites_method ON method_favorites(method_id);

-- RLS Policies
ALTER TABLE question_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE method_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Question favorites are viewable by everyone" ON question_favorites;
CREATE POLICY "Question favorites are viewable by everyone" ON question_favorites
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add their own question favorites" ON question_favorites;
CREATE POLICY "Users can add their own question favorites" ON question_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own question favorites" ON question_favorites;
CREATE POLICY "Users can remove their own question favorites" ON question_favorites
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Method favorites are viewable by everyone" ON method_favorites;
CREATE POLICY "Method favorites are viewable by everyone" ON method_favorites
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add their own method favorites" ON method_favorites;
CREATE POLICY "Users can add their own method favorites" ON method_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own method favorites" ON method_favorites;
CREATE POLICY "Users can remove their own method favorites" ON method_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FERTIG!
-- ============================================================================
-- Die Datenbank ist jetzt vollständig eingerichtet.
-- ============================================================================

