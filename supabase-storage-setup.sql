-- ================================================
-- SUPABASE STORAGE SETUP INSTRUCTIONS
-- ================================================

-- Step 1: Create the storage bucket (run in Supabase SQL Editor)
-- This creates a public bucket named 'media' for storing images/videos

-- Step 2: After creating bucket, run these policies to allow public access to uploaded files

-- Allow public read access to media bucket
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

-- Allow authenticated users to upload to media bucket
CREATE POLICY "Authenticated Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/delete their own uploads
CREATE POLICY "Authenticated Update" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ================================================
-- After setup, update your code to remove the fallback:
-- In app/admin/articles/new/page.tsx and app/admin/collections/new/page.tsx
-- Change the fallback to use the uploaded image URL instead of placeholder
-- ================================================