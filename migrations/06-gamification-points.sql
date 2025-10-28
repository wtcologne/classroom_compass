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

