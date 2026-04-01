-- ================================================
-- RLS POLICIES UPDATE - Run this in Supabase SQL Editor
-- Required for admin to create new articles and collections
-- ================================================

-- ================================================
-- ARTICLES POLICIES
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Users can update articles" ON articles;
DROP POLICY IF EXISTS "Users can delete articles" ON articles;

-- View published articles (public)
CREATE POLICY "Anyone can view published articles" 
ON articles FOR SELECT 
USING (status = 'published');

-- Insert articles (authenticated users)
CREATE POLICY "Authenticated users can insert articles" 
ON articles FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Update articles (authenticated users)
CREATE POLICY "Users can update articles" 
ON articles FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Delete articles (authenticated users)
CREATE POLICY "Users can delete articles" 
ON articles FOR DELETE 
USING (auth.role() = 'authenticated');

-- ================================================
-- COLLECTIONS POLICIES
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can insert collections" ON collections;
DROP POLICY IF EXISTS "Users can update collections" ON collections;
DROP POLICY IF EXISTS "Users can delete collections" ON collections;

-- View collections (public)
CREATE POLICY "Anyone can view collections" 
ON collections FOR SELECT 
USING (true);

-- Insert collections (authenticated users)
CREATE POLICY "Authenticated users can insert collections" 
ON collections FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Update collections (authenticated users)
CREATE POLICY "Users can update collections" 
ON collections FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Delete collections (authenticated users)
CREATE POLICY "Users can delete collections" 
ON collections FOR DELETE 
USING (auth.role() = 'authenticated');

-- ================================================
-- LOOKS POLICIES
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view looks" ON looks;
DROP POLICY IF EXISTS "Authenticated users can insert looks" ON looks;
DROP POLICY IF EXISTS "Users can update looks" ON looks;
DROP POLICY IF EXISTS "Users can delete looks" ON looks;

-- View looks (public)
CREATE POLICY "Anyone can view looks" 
ON looks FOR SELECT 
USING (true);

-- Insert looks (authenticated users)
CREATE POLICY "Authenticated users can insert looks" 
ON looks FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Update looks (authenticated users)
CREATE POLICY "Users can update looks" 
ON looks FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Delete looks (authenticated users)
CREATE POLICY "Users can delete looks" 
ON looks FOR DELETE 
USING (auth.role() = 'authenticated');

-- ================================================
-- DESIGNERS POLICIES
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view designers" ON designers;
DROP POLICY IF EXISTS "Authenticated users can insert designers" ON designers;
DROP POLICY IF EXISTS "Users can update designers" ON designers;
DROP POLICY IF EXISTS "Users can delete designers" ON designers;

-- View designers (public)
CREATE POLICY "Anyone can view designers" 
ON designers FOR SELECT 
USING (true);

-- Insert designers (authenticated users)
CREATE POLICY "Authenticated users can insert designers" 
ON designers FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Update designers (authenticated users)
CREATE POLICY "Users can update designers" 
ON designers FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Delete designers (authenticated users)
CREATE POLICY "Users can delete designers" 
ON designers FOR DELETE 
USING (auth.role() = 'authenticated');

-- ================================================
-- PROFILES POLICIES
-- ================================================

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to view all profiles (for following features)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" 
ON profiles FOR SELECT 
USING (true);

-- ================================================
-- BOOKMARKS POLICIES
-- ================================================

-- Keep existing - users can manage own bookmarks
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
CREATE POLICY "Users can manage own bookmarks" 
ON bookmarks FOR ALL 
USING (auth.uid() = user_id);

-- ================================================
-- COMPLETE - Now run this in your Supabase SQL Editor
-- ================================================