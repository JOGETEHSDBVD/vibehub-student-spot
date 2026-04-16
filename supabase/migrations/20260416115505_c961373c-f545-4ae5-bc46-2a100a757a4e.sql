
-- 1. Drop the overly permissive "Anyone can read profiles" policy
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- 2. Re-create it for authenticated users only
CREATE POLICY "Authenticated users can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_not_banned());

-- 3. Drop the permissive user self-update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 4. Users should only update via the update_own_profile RPC (security definer).
--    No direct UPDATE policy for regular users on profiles.
