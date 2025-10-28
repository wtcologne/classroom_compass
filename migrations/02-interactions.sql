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

-- 9. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_question_upvotes_question ON question_upvotes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_user ON question_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_method ON method_ratings(method_id);
CREATE INDEX IF NOT EXISTS idx_method_ratings_user ON method_ratings(user_id);
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

