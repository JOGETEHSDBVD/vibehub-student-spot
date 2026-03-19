
-- 1. Create a ban-check helper function
CREATE OR REPLACE FUNCTION public.is_not_banned()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT COALESCE(
    (SELECT is_banned FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- 2. Create a safe profile update function that prevents users from modifying is_banned
CREATE OR REPLACE FUNCTION public.update_own_profile(
  _full_name text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _member_type text DEFAULT NULL,
  _pole text DEFAULT NULL,
  _filiere text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET
    full_name = COALESCE(_full_name, full_name),
    avatar_url = COALESCE(_avatar_url, avatar_url),
    member_type = COALESCE(_member_type, member_type),
    pole = COALESCE(_pole, pole),
    filiere = COALESCE(_filiere, filiere),
    updated_at = now()
  WHERE id = auth.uid()
    AND is_banned = false;
END;
$$;

-- 3. Drop and recreate user-facing policies on profiles to enforce ban check
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id AND is_not_banned())
  WITH CHECK (auth.uid() = id AND is_not_banned());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Update events policies for authenticated users
DROP POLICY IF EXISTS "Everyone can view events" ON public.events;
CREATE POLICY "Everyone can view events"
  ON public.events FOR SELECT TO authenticated
  USING (is_not_banned());

-- 5. Update event_participants policies
DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;
CREATE POLICY "Users can join events"
  ON public.event_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_not_banned());

DROP POLICY IF EXISTS "Users can leave events" ON public.event_participants;
CREATE POLICY "Users can leave events"
  ON public.event_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND is_not_banned());

DROP POLICY IF EXISTS "Users can view participants" ON public.event_participants;
CREATE POLICY "Users can view participants"
  ON public.event_participants FOR SELECT TO authenticated
  USING (is_not_banned() AND EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_participants.event_id AND e.is_published = true
  ));

-- 6. Update announcements policy
DROP POLICY IF EXISTS "Everyone can view announcements" ON public.announcements;
CREATE POLICY "Everyone can view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (is_not_banned());

-- 7. Update admin_messages user policy
DROP POLICY IF EXISTS "Users can read own messages" ON public.admin_messages;
CREATE POLICY "Users can read own messages"
  ON public.admin_messages FOR SELECT TO authenticated
  USING (auth.uid() = to_user_id AND is_not_banned());
