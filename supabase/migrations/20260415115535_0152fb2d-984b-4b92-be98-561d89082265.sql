
-- Add requires_approval and seat_limit to events
ALTER TABLE public.events
ADD COLUMN requires_approval boolean NOT NULL DEFAULT false,
ADD COLUMN seat_limit integer DEFAULT NULL;

-- Add status column to event_participants
ALTER TABLE public.event_participants
ADD COLUMN status text NOT NULL DEFAULT 'approved';

-- Update existing participants to 'approved'
UPDATE public.event_participants SET status = 'approved' WHERE status = 'approved';
