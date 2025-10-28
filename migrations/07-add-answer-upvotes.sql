-- ============================================================================
-- ADD ANSWER UPVOTES TABLE
-- ============================================================================
-- Diese Migration fügt die fehlende answer_upvotes Tabelle hinzu

-- Answer Upvotes Tabelle (falls sie noch nicht existiert)
CREATE TABLE IF NOT EXISTS answer_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- RLS Policies für answer_upvotes
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

-- Funktion und Trigger für Answer Upvotes Count
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

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_answer ON answer_upvotes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_user ON answer_upvotes(user_id);

-- Fertig!
DO $$
BEGIN
    RAISE NOTICE '✅ answer_upvotes Tabelle wurde erfolgreich hinzugefügt!';
END $$;

