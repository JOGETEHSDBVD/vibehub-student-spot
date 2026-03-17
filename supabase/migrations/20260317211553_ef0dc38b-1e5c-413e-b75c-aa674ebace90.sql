
-- Create event_participants table
CREATE TABLE public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Admins can read all participants
CREATE POLICY "Admins can read all participants"
  ON public.event_participants FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage participants
CREATE POLICY "Admins can manage participants"
  ON public.event_participants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read participants of published events
CREATE POLICY "Users can view participants"
  ON public.event_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.is_published = true
    )
  );

-- Users can join events themselves
CREATE POLICY "Users can join events"
  ON public.event_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can leave events themselves
CREATE POLICY "Users can leave events"
  ON public.event_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
