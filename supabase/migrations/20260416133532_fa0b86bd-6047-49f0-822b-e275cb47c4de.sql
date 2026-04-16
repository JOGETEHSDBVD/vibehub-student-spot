-- Drop overly broad SELECT policies that allow listing all files
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to event images" ON storage.objects;

-- Replace with scoped SELECT policies
-- Avatars: users can only list their own folder
CREATE POLICY "Users can list own avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Event images: only admins can list event images
CREATE POLICY "Admins can list event images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'event-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Covers: users can list their own covers
CREATE POLICY "Users can list own covers"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);