-- ================================================
-- ANOCE FASHION DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  saved_articles TEXT[] DEFAULT '{}',
  saved_looks TEXT[] DEFAULT '{}',
  followed_brands TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designers table
CREATE TABLE IF NOT EXISTS designers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('high-end', 'contemporary', 'emerging')),
  bio TEXT,
  short_bio TEXT,
  profile_image TEXT,
  cover_image TEXT,
  founded INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  designer_name TEXT NOT NULL,
  designer_slug TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('SS', 'FW')),
  year INTEGER NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Looks table
CREATE TABLE IF NOT EXISTS looks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  materials TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL CHECK (category IN ('features', 'interviews', 'news', 'trends')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  cover_image TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  designer_slug TEXT,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'look', 'designer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Designers policies (public read)
DROP POLICY IF EXISTS "Anyone can view designers" ON designers;
CREATE POLICY "Anyone can view designers" ON designers FOR SELECT USING (true);

-- Collections policies (public read)
DROP POLICY IF EXISTS "Anyone can view collections" ON collections;
CREATE POLICY "Anyone can view collections" ON collections FOR SELECT USING (true);

-- Allow authenticated users to insert collections
DROP POLICY IF EXISTS "Authenticated users can insert collections" ON collections;
CREATE POLICY "Authenticated users can insert collections" ON collections FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update collections
DROP POLICY IF EXISTS "Users can update collections" ON collections;
CREATE POLICY "Users can update collections" ON collections FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete collections
DROP POLICY IF EXISTS "Users can delete collections" ON collections;
CREATE POLICY "Users can delete collections" ON collections FOR DELETE USING (auth.role() = 'authenticated');

-- Looks policies (public read)
DROP POLICY IF EXISTS "Anyone can view looks" ON looks;
CREATE POLICY "Anyone can view looks" ON looks FOR SELECT USING (true);

-- Articles policies
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
CREATE POLICY "Anyone can view published articles" ON articles FOR SELECT USING (status = 'published');

-- Allow authenticated users to insert articles
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
CREATE POLICY "Authenticated users can insert articles" ON articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own articles or any draft/review
DROP POLICY IF EXISTS "Users can update articles" ON articles;
CREATE POLICY "Users can update articles" ON articles FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Users can delete articles" ON articles;
CREATE POLICY "Users can delete articles" ON articles FOR DELETE USING (auth.role() = 'authenticated');

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- AUTO CREATE PROFILE ON SIGNUP (using service role)
-- ================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON profiles TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
