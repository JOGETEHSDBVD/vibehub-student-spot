
-- Add recap column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS recap text;

-- Create event_media table for photos/videos of past events
CREATE TABLE public.event_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event media" ON public.event_media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view event media" ON public.event_media
  FOR SELECT TO authenticated
  USING (is_not_banned());

CREATE POLICY "Anon can view event media" ON public.event_media
  FOR SELECT TO anon
  USING (true);
