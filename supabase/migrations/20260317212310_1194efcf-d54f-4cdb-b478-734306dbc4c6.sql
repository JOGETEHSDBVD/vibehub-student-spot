
SELECT cron.schedule(
  'unpublish-past-events',
  '0 * * * *',
  $$
    UPDATE public.events
    SET is_published = false
    WHERE is_published = true
      AND date < now();
  $$
);
