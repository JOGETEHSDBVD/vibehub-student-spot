CREATE OR REPLACE FUNCTION public.update_own_profile(
  _full_name text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _member_type text DEFAULT NULL,
  _pole text DEFAULT NULL,
  _filiere text DEFAULT NULL,
  _cover_url text DEFAULT NULL,
  _linkedin_url text DEFAULT NULL,
  _instagram_url text DEFAULT NULL,
  _facebook_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET
    full_name = COALESCE(_full_name, full_name),
    avatar_url = COALESCE(_avatar_url, avatar_url),
    member_type = COALESCE(_member_type, member_type),
    pole = COALESCE(_pole, pole),
    filiere = COALESCE(_filiere, filiere),
    cover_url = COALESCE(_cover_url, cover_url),
    linkedin_url = COALESCE(_linkedin_url, linkedin_url),
    instagram_url = COALESCE(_instagram_url, instagram_url),
    facebook_url = COALESCE(_facebook_url, facebook_url),
    updated_at = now()
  WHERE id = auth.uid()
    AND is_banned = false;
END;
$$;

-- Create covers bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for covers bucket
CREATE POLICY "Users can upload own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own cover"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');