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

