-- ================================================
-- SUPABASE STORAGE SETUP
-- Run in Supabase SQL Editor
-- ================================================

-- Create buckets used by admin uploads (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('media', 'media', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Clean old generic policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;

-- Policies for media + covers buckets
DROP POLICY IF EXISTS "Public read media and covers" ON storage.objects;
CREATE POLICY "Public read media and covers"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('media', 'covers'));

DROP POLICY IF EXISTS "Authenticated insert media and covers" ON storage.objects;
CREATE POLICY "Authenticated insert media and covers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id IN ('media', 'covers') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update media and covers" ON storage.objects;
CREATE POLICY "Authenticated update media and covers"
ON storage.objects
FOR UPDATE
USING (bucket_id IN ('media', 'covers') AND auth.role() = 'authenticated')
WITH CHECK (bucket_id IN ('media', 'covers') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete media and covers" ON storage.objects;
CREATE POLICY "Authenticated delete media and covers"
ON storage.objects
FOR DELETE
USING (bucket_id IN ('media', 'covers') AND auth.role() = 'authenticated');
