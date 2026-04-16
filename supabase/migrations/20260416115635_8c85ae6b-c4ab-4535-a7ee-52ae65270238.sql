
-- 1. Fix event-images upload: restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
CREATE POLICY "Admins can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Fix public bucket listing: drop broad SELECT policies and replace with scoped ones
-- Event-images
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;

-- Avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Covers
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
