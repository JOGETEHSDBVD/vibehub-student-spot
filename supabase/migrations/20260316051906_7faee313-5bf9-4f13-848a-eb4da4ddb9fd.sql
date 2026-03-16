
-- Add new columns to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Culture',
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload event images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Allow public read access to event images
CREATE POLICY "Public read access to event images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-images');

-- Allow admins to delete event images
CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for public to view published events (anon)
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT TO anon
USING (is_published = true);
