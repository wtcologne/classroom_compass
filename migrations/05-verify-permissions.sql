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

