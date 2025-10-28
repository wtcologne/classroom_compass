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

