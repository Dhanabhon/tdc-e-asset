-- Migration: Create 'asset-images' Storage Bucket and Policies
-- Timestamp: 20260902_create_storage_bucket.sql

-- 1. Create public bucket 'asset-images' if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'asset-images',
    'asset-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Storage Policies for 'asset-images'

-- Allow public read access to all images
DROP POLICY IF EXISTS "Allow public to read asset-images" ON storage.objects;
CREATE POLICY "Allow public to read asset-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'asset-images');

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated to insert asset-images" ON storage.objects;
CREATE POLICY "Allow authenticated to insert asset-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-images');

-- Allow authenticated users to update images
DROP POLICY IF EXISTS "Allow authenticated to update asset-images" ON storage.objects;
CREATE POLICY "Allow authenticated to update asset-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'asset-images')
WITH CHECK (bucket_id = 'asset-images');

-- Allow authenticated users to delete images
DROP POLICY IF EXISTS "Allow authenticated to delete asset-images" ON storage.objects;
CREATE POLICY "Allow authenticated to delete asset-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'asset-images');

NOTIFY pgrst, 'reload schema';
