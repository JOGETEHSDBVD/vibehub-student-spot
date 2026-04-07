
-- Add qr_enabled column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS qr_enabled boolean NOT NULL DEFAULT false;

-- Create event_tickets table
CREATE TABLE public.event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used boolean NOT NULL DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own tickets
CREATE POLICY "Users can read own tickets"
ON public.event_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own tickets
CREATE POLICY "Users can insert own tickets"
ON public.event_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND is_not_banned());

-- Admins can read all tickets
CREATE POLICY "Admins can read all tickets"
ON public.event_tickets FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update tickets (for check-in)
CREATE POLICY "Admins can update tickets"
ON public.event_tickets FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins full manage
CREATE POLICY "Admins can manage tickets"
ON public.event_tickets FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
