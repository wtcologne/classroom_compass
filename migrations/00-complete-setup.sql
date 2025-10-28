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
-- Interactions Schema
-- Fügt Tabellen für Upvotes und User-Interaktionen hinzu

-- 1. Question Upvotes Tabelle (um zu tracken, wer upgevoted hat)
CREATE TABLE IF NOT EXISTS question_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- 2. Method Ratings Tabelle (separate Ratings von Comments)
CREATE TABLE IF NOT EXISTS method_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(method_id, user_id)
);

-- 2a. Answer Upvotes Tabelle (um zu tracken, wer answers upgevoted hat)
CREATE TABLE IF NOT EXISTS answer_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- 2b. Answers Tabelle überprüfen und reparieren
DO $$
BEGIN
    -- Wenn answers Tabelle nicht existiert, erstellen
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'answers') THEN
        CREATE TABLE answers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
          content TEXT NOT NULL,
          author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          upvotes INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabelle answers wurde erstellt';
    END IF;
    
    -- Fehlende Spalten hinzufügen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'question_id'
    ) THEN
        ALTER TABLE answers ADD COLUMN question_id UUID REFERENCES questions(id) ON DELETE CASCADE;
        RAISE NOTICE 'Spalte answers.question_id wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'content'
    ) THEN
        ALTER TABLE answers ADD COLUMN content TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Spalte answers.content wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE answers ADD COLUMN author_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Spalte answers.author_id wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'upvotes'
    ) THEN
        ALTER TABLE answers ADD COLUMN upvotes INTEGER DEFAULT 0;
        RAISE NOTICE 'Spalte answers.upvotes wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE answers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Spalte answers.created_at wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE answers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Spalte answers.updated_at wurde hinzugefügt';
    END IF;
END $$;

-- 2c. Comments Tabelle überprüfen und reparieren
DO $$
BEGIN
    -- Wenn comments Tabelle nicht existiert, erstellen
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
        CREATE TABLE comments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
          content TEXT NOT NULL,
          author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabelle comments wurde erstellt';
    END IF;
    
    -- Fehlende Spalten hinzufügen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'method_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN method_id UUID REFERENCES methods(id) ON DELETE CASCADE;
        RAISE NOTICE 'Spalte comments.method_id wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'content'
    ) THEN
        ALTER TABLE comments ADD COLUMN content TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Spalte comments.content wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN author_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Spalte comments.author_id wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'rating'
    ) THEN
        ALTER TABLE comments ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
        RAISE NOTICE 'Spalte comments.rating wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE comments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Spalte comments.created_at wurde hinzugefügt';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Spalte comments.updated_at wurde hinzugefügt';
    END IF;
END $$;

-- 3. RLS Policies für question_upvotes
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'question_upvotes' AND policyname = 'Upvotes are viewable by everyone'
    ) THEN
        CREATE POLICY "Upvotes are viewable by everyone" ON question_upvotes
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'question_upvotes' AND policyname = 'Authenticated users can upvote'
    ) THEN
        CREATE POLICY "Authenticated users can upvote" ON question_upvotes
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'question_upvotes' AND policyname = 'Users can remove their own upvotes'
    ) THEN
        CREATE POLICY "Users can remove their own upvotes" ON question_upvotes
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. RLS Policies für method_ratings
ALTER TABLE method_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'method_ratings' AND policyname = 'Ratings are viewable by everyone'
    ) THEN
        CREATE POLICY "Ratings are viewable by everyone" ON method_ratings
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'method_ratings' AND policyname = 'Authenticated users can rate'
    ) THEN
        CREATE POLICY "Authenticated users can rate" ON method_ratings
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'method_ratings' AND policyname = 'Users can update their own ratings'
    ) THEN
        CREATE POLICY "Users can update their own ratings" ON method_ratings
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'method_ratings' AND policyname = 'Users can delete their own ratings'
    ) THEN
        CREATE POLICY "Users can delete their own ratings" ON method_ratings
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4b. RLS Policies für answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Answers are viewable by everyone'
    ) THEN
        CREATE POLICY "Answers are viewable by everyone" ON answers
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Authenticated users can answer'
    ) THEN
        CREATE POLICY "Authenticated users can answer" ON answers
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Users can update their own answers'
    ) THEN
        CREATE POLICY "Users can update their own answers" ON answers
        FOR UPDATE USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Users can delete their own answers'
    ) THEN
        CREATE POLICY "Users can delete their own answers" ON answers
        FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

-- 4b2. RLS Policies für answer_upvotes
ALTER TABLE answer_upvotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_upvotes' AND policyname = 'Answer upvotes are viewable by everyone'
    ) THEN
        CREATE POLICY "Answer upvotes are viewable by everyone" ON answer_upvotes
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_upvotes' AND policyname = 'Authenticated users can upvote answers'
    ) THEN
        CREATE POLICY "Authenticated users can upvote answers" ON answer_upvotes
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_upvotes' AND policyname = 'Users can remove their own answer upvotes'
    ) THEN
        CREATE POLICY "Users can remove their own answer upvotes" ON answer_upvotes
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4c. RLS Policies für comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Comments are viewable by everyone'
    ) THEN
        CREATE POLICY "Comments are viewable by everyone" ON comments
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Authenticated users can comment'
    ) THEN
        CREATE POLICY "Authenticated users can comment" ON comments
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Users can update their own comments'
    ) THEN
        CREATE POLICY "Users can update their own comments" ON comments
        FOR UPDATE USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments'
    ) THEN
        CREATE POLICY "Users can delete their own comments" ON comments
        FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

-- 5. Funktion zum Aktualisieren der Question Upvote-Counts
CREATE OR REPLACE FUNCTION update_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE questions 
    SET upvotes = upvotes + 1 
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE questions 
    SET upvotes = GREATEST(upvotes - 1, 0)
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger für Question Upvotes
DROP TRIGGER IF EXISTS trigger_update_question_upvotes ON question_upvotes;
CREATE TRIGGER trigger_update_question_upvotes
  AFTER INSERT OR DELETE ON question_upvotes
  FOR EACH ROW EXECUTE PROCEDURE update_question_upvotes();

-- 7. Funktion zum Aktualisieren der Method Ratings
CREATE OR REPLACE FUNCTION update_method_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_cnt INTEGER;
BEGIN
  -- Berechne neuen Durchschnitt und Count
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
  INTO avg_rating, rating_cnt
  FROM method_ratings
  WHERE method_id = COALESCE(NEW.method_id, OLD.method_id);
  
  -- Update Method
  UPDATE methods
  SET rating = COALESCE(avg_rating, 0),
      rating_count = rating_cnt
  WHERE id = COALESCE(NEW.method_id, OLD.method_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger für Method Ratings
DROP TRIGGER IF EXISTS trigger_update_method_rating ON method_ratings;
CREATE TRIGGER trigger_update_method_rating
  AFTER INSERT OR UPDATE OR DELETE ON method_ratings
  FOR EACH ROW EXECUTE PROCEDURE update_method_rating();

-- 8b. Funktion und Trigger für Answer Upvotes Count
CREATE OR REPLACE FUNCTION update_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE answers 
    SET upvotes = upvotes + 1 
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE answers 
    SET upvotes = GREATEST(upvotes - 1, 0)
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_answer_upvotes ON answer_upvotes;
CREATE TRIGGER trigger_update_answer_upvotes
  AFTER INSERT OR DELETE ON answer_upvotes
  FOR EACH ROW EXECUTE PROCEDURE update_answer_upvotes();

-- 9. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_question_upvotes_question ON question_upvotes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_user ON question_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_method ON method_ratings(method_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_user ON method_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_answer ON answer_upvotes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_user ON answer_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_method ON comments(method_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- 10. Updated_at Trigger für method_ratings, answers und comments
DROP TRIGGER IF EXISTS handle_updated_at_method_ratings ON method_ratings;
CREATE TRIGGER handle_updated_at_method_ratings
  BEFORE UPDATE ON method_ratings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_answers ON answers;
CREATE TRIGGER handle_updated_at_answers
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_comments ON comments;
CREATE TRIGGER handle_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Erfolg
DO $$
BEGIN
    RAISE NOTICE '✅ Interactions-Tabellen erfolgreich erstellt!';
END $$;

-- Add Favorites Feature
-- Ermöglicht Benutzern, Fragen und Methoden als Favoriten zu markieren

-- ============================================================================
-- TABELLEN
-- ============================================================================

-- Question Favorites Table
-- Speichert, welche Fragen ein Benutzer als Favorit markiert hat
CREATE TABLE IF NOT EXISTS question_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Stelle sicher, dass ein User eine Frage nur einmal favorisieren kann
  UNIQUE(user_id, question_id)
);

-- Method Favorites Table
-- Speichert, welche Methoden ein Benutzer als Favorit markiert hat
CREATE TABLE IF NOT EXISTS method_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  method_id UUID REFERENCES methods(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Stelle sicher, dass ein User eine Methode nur einmal favorisieren kann
  UNIQUE(user_id, method_id)
);

-- ============================================================================
-- INDIZES für bessere Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_question_favorites_user ON question_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_question_favorites_question ON question_favorites(question_id);
CREATE INDEX IF NOT EXISTS idx_method_favorites_user ON method_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_method_favorites_method ON method_favorites(method_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Question Favorites Policies
ALTER TABLE question_favorites ENABLE ROW LEVEL SECURITY;

-- Jeder kann sehen, wie viele Favoriten eine Frage hat (optional)
CREATE POLICY "Question favorites are viewable by everyone" ON question_favorites
  FOR SELECT USING (true);

-- Benutzer können ihre eigenen Favoriten hinzufügen
CREATE POLICY "Users can add their own question favorites" ON question_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Favoriten entfernen
CREATE POLICY "Users can remove their own question favorites" ON question_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Method Favorites Policies
ALTER TABLE method_favorites ENABLE ROW LEVEL SECURITY;

-- Jeder kann sehen, wie viele Favoriten eine Methode hat (optional)
CREATE POLICY "Method favorites are viewable by everyone" ON method_favorites
  FOR SELECT USING (true);

-- Benutzer können ihre eigenen Favoriten hinzufügen
CREATE POLICY "Users can add their own method favorites" ON method_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Favoriten entfernen
CREATE POLICY "Users can remove their own method favorites" ON method_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNKTIONEN für Favoriten-Anzahl (optional)
-- ============================================================================

-- Funktion zum Zählen der Favoriten für eine Frage
CREATE OR REPLACE FUNCTION get_question_favorites_count(question_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM question_favorites
  WHERE question_id = question_uuid;
$$ LANGUAGE SQL STABLE;

-- Funktion zum Zählen der Favoriten für eine Methode
CREATE OR REPLACE FUNCTION get_method_favorites_count(method_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM method_favorites
  WHERE method_id = method_uuid;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- VIEWS für einfachere Abfragen (optional)
-- ============================================================================

-- View für Fragen mit Favoriten-Anzahl
CREATE OR REPLACE VIEW questions_with_favorites AS
SELECT 
  q.*,
  COUNT(qf.id) AS favorites_count
FROM questions q
LEFT JOIN question_favorites qf ON q.id = qf.question_id
GROUP BY q.id;

-- View für Methoden mit Favoriten-Anzahl
CREATE OR REPLACE VIEW methods_with_favorites AS
SELECT 
  m.*,
  COUNT(mf.id) AS favorites_count
FROM methods m
LEFT JOIN method_favorites mf ON m.id = mf.method_id
GROUP BY m.id;

-- Fix Anonymous Questions Migration
-- Dieses Script passt die questions Tabelle an, sodass author_id auch bei anonymen Fragen gespeichert wird
-- Das is_anonymous Flag bestimmt nur noch die Anzeige, nicht die interne Zuordnung

-- 1. Update existierende anonyme Fragen (Optional - nur falls vorhanden)
-- WICHTIG: Dies kann nicht rückgängig gemacht werden!
-- Falls es anonyme Fragen ohne author_id gibt, werden diese gelöscht oder einem Admin zugeordnet
-- Kommentiere diese Zeile aus, wenn du keine anonymen Fragen in der DB hast:
-- DELETE FROM questions WHERE author_id IS NULL;

-- 2. Ändere author_id zu NOT NULL (Optional - nur wenn alle Fragen einen author_id haben)
-- Falls du dies aktivierst, stelle sicher, dass alle Fragen einen author_id haben:
-- ALTER TABLE questions ALTER COLUMN author_id SET NOT NULL;

-- 3. Ändere die Foreign Key Constraint zu CASCADE statt SET NULL
-- Dies sorgt dafür, dass Fragen gelöscht werden, wenn der Autor gelöscht wird
ALTER TABLE questions 
  DROP CONSTRAINT IF EXISTS questions_author_id_fkey;

ALTER TABLE questions 
  ADD CONSTRAINT questions_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 4. Update RLS Policies für bessere Sicherheit
-- Stelle sicher, dass Nutzer ihre eigenen Fragen bearbeiten können (auch anonyme)

-- Lösche alte Policies
DROP POLICY IF EXISTS "Users can update their own questions" ON questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON questions;

-- Erstelle neue Policies
CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = author_id);

-- Kommentar: 
-- Die INSERT Policy bleibt unverändert, da sie nur prüft, ob der User authentifiziert ist
-- Die SELECT Policy bleibt unverändert, da alle Fragen für alle sichtbar sind
-- Das is_anonymous Flag wird in der Anwendungslogik verwendet, nicht in den Policies

-- 5. Optional: Füge einen Index hinzu für bessere Performance bei "Meine Fragen" Filter
-- Dieser existiert bereits in der Schema-Datei, aber zur Sicherheit:
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_anonymous ON questions(is_anonymous);

-- Verify Permissions SQL
-- Dieses Skript überprüft, ob die RLS Policies korrekt sind

-- Zeige alle Policies für methods
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'methods'
ORDER BY policyname;

-- Zeige alle Policies für comments
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY policyname;

-- Zeige alle Policies für questions
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'questions'
ORDER BY policyname;

-- INFO: Die korrekten Policies sollten sein:
-- 
-- METHODS:
-- ✓ "Methods are viewable by everyone" - SELECT - true
-- ✓ "Authenticated users can insert methods" - INSERT - authenticated
-- ✓ "Users can update their own methods" - UPDATE - auth.uid() = author_id
-- ✓ "Users can delete their own methods" - DELETE - auth.uid() = author_id
--
-- COMMENTS:
-- ✓ "Comments are viewable by everyone" - SELECT - true
-- ✓ "Authenticated users can comment" - INSERT - authenticated AND auth.uid() = author_id
-- ✓ "Users can update their own comments" - UPDATE - auth.uid() = author_id
-- ✓ "Users can delete their own comments" - DELETE - auth.uid() = author_id
--
-- QUESTIONS:
-- ✓ "Questions are viewable by everyone" - SELECT - true
-- ✓ "Authenticated users can insert questions" - INSERT - authenticated
-- ✓ "Users can update their own questions" - UPDATE - auth.uid() = author_id
-- ✓ "Users can delete their own questions" - DELETE - auth.uid() = author_id

-- ============================================================================
-- GAMIFICATION & POINTS SYSTEM
-- ============================================================================
-- Implementiert ein Punktesystem für User-Aktivitäten und automatische Updates

-- ============================================================================
-- TRIGGER-FUNKTIONEN FÜR PUNKTE
-- ============================================================================

-- Funktion: Punkte für neue Methode (+1)
CREATE OR REPLACE FUNCTION award_points_for_method()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET points = points + 1
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Punkte für neue Frage (+1)
CREATE OR REPLACE FUNCTION award_points_for_question()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET points = points + 1
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Punkte für neue Antwort (+1)
CREATE OR REPLACE FUNCTION award_points_for_answer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET points = points + 1
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Punkte für Method Rating (+1 für Author)
CREATE OR REPLACE FUNCTION award_points_for_method_rating()
RETURNS TRIGGER AS $$
DECLARE
  method_author_id UUID;
BEGIN
  -- Finde den Author der Methode
  SELECT author_id INTO method_author_id
  FROM methods
  WHERE id = NEW.method_id;
  
  -- Gib dem Author einen Punkt
  IF method_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = points + 1
    WHERE id = method_author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Punkte für Question Upvote (+1 für Author)
CREATE OR REPLACE FUNCTION award_points_for_question_upvote()
RETURNS TRIGGER AS $$
DECLARE
  question_author_id UUID;
BEGIN
  -- Finde den Author der Frage
  SELECT author_id INTO question_author_id
  FROM questions
  WHERE id = NEW.question_id;
  
  -- Gib dem Author einen Punkt
  IF question_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = points + 1
    WHERE id = question_author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Punkte für Answer Upvote (+1 für Author)
CREATE OR REPLACE FUNCTION award_points_for_answer_upvote()
RETURNS TRIGGER AS $$
DECLARE
  answer_author_id UUID;
BEGIN
  -- Finde den Author der Antwort
  SELECT author_id INTO answer_author_id
  FROM answers
  WHERE id = NEW.answer_id;
  
  -- Gib dem Author einen Punkt
  IF answer_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = points + 1
    WHERE id = answer_author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FÜR PUNKTE-VERGABE
-- ============================================================================

-- Trigger: Neue Methode
DROP TRIGGER IF EXISTS trigger_award_points_method ON methods;
CREATE TRIGGER trigger_award_points_method
  AFTER INSERT ON methods
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_method();

-- Trigger: Neue Frage
DROP TRIGGER IF EXISTS trigger_award_points_question ON questions;
CREATE TRIGGER trigger_award_points_question
  AFTER INSERT ON questions
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_question();

-- Trigger: Neue Antwort
DROP TRIGGER IF EXISTS trigger_award_points_answer ON answers;
CREATE TRIGGER trigger_award_points_answer
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_answer();

-- Trigger: Method Rating
DROP TRIGGER IF EXISTS trigger_award_points_method_rating ON method_ratings;
CREATE TRIGGER trigger_award_points_method_rating
  AFTER INSERT ON method_ratings
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_method_rating();

-- Trigger: Question Upvote
DROP TRIGGER IF EXISTS trigger_award_points_question_upvote ON question_upvotes;
CREATE TRIGGER trigger_award_points_question_upvote
  AFTER INSERT ON question_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_question_upvote();

-- Trigger: Answer Upvote
DROP TRIGGER IF EXISTS trigger_award_points_answer_upvote ON answer_upvotes;
CREATE TRIGGER trigger_award_points_answer_upvote
  AFTER INSERT ON answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_answer_upvote();

-- ============================================================================
-- PUNKTE ABZIEHEN BEI DELETE (optional)
-- ============================================================================

-- Wenn ein Rating gelöscht wird, Punkt wieder abziehen
CREATE OR REPLACE FUNCTION remove_points_for_method_rating()
RETURNS TRIGGER AS $$
DECLARE
  method_author_id UUID;
BEGIN
  SELECT author_id INTO method_author_id
  FROM methods
  WHERE id = OLD.method_id;
  
  IF method_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = GREATEST(0, points - 1)
    WHERE id = method_author_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_remove_points_method_rating ON method_ratings;
CREATE TRIGGER trigger_remove_points_method_rating
  AFTER DELETE ON method_ratings
  FOR EACH ROW
  EXECUTE FUNCTION remove_points_for_method_rating();

-- Wenn ein Question Upvote gelöscht wird, Punkt abziehen
CREATE OR REPLACE FUNCTION remove_points_for_question_upvote()
RETURNS TRIGGER AS $$
DECLARE
  question_author_id UUID;
BEGIN
  SELECT author_id INTO question_author_id
  FROM questions
  WHERE id = OLD.question_id;
  
  IF question_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = GREATEST(0, points - 1)
    WHERE id = question_author_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_remove_points_question_upvote ON question_upvotes;
CREATE TRIGGER trigger_remove_points_question_upvote
  AFTER DELETE ON question_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION remove_points_for_question_upvote();

-- Wenn ein Answer Upvote gelöscht wird, Punkt abziehen
CREATE OR REPLACE FUNCTION remove_points_for_answer_upvote()
RETURNS TRIGGER AS $$
DECLARE
  answer_author_id UUID;
BEGIN
  SELECT author_id INTO answer_author_id
  FROM answers
  WHERE id = OLD.answer_id;
  
  IF answer_author_id IS NOT NULL THEN
    UPDATE profiles
    SET points = GREATEST(0, points - 1)
    WHERE id = answer_author_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_remove_points_answer_upvote ON answer_upvotes;
CREATE TRIGGER trigger_remove_points_answer_upvote
  AFTER DELETE ON answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION remove_points_for_answer_upvote();

-- ============================================================================
-- HILFSFUNKTION: Level berechnen
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_level(user_points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF user_points >= 600 THEN
    RETURN 'Didaktik-Meister:in';
  ELSIF user_points >= 300 THEN
    RETURN 'Methoden-Coach';
  ELSIF user_points >= 150 THEN
    RETURN 'Erfahrene:r Kolleg:in';
  ELSIF user_points >= 50 THEN
    RETURN 'Aktive:r Lehrer:in';
  ELSE
    RETURN 'Einsteiger:in';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FERTIG!
-- ============================================================================
-- Das Punktesystem ist jetzt aktiv und vergibt automatisch Punkte für:
-- ✓ Neue Methoden (+1)
-- ✓ Neue Fragen (+1)
-- ✓ Neue Antworten (+1)
-- ✓ Ratings auf eigene Methoden (+1)
-- ✓ Upvotes auf eigene Fragen (+1)
-- ✓ Upvotes auf eigene Antworten (+1)

