-- Update update_own_profile to validate social URLs server-side
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
  -- Validate social URLs must use http(s) scheme
  IF _linkedin_url IS NOT NULL AND _linkedin_url != '' AND _linkedin_url !~ '^https?://' THEN
    RAISE EXCEPTION 'Invalid LinkedIn URL: must start with http:// or https://';
  END IF;
  IF _instagram_url IS NOT NULL AND _instagram_url != '' AND _instagram_url !~ '^https?://' THEN
    RAISE EXCEPTION 'Invalid Instagram URL: must start with http:// or https://';
  END IF;
  IF _facebook_url IS NOT NULL AND _facebook_url != '' AND _facebook_url !~ '^https?://' THEN
    RAISE EXCEPTION 'Invalid Facebook URL: must start with http:// or https://';
  END IF;

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

-- Add DELETE policy for covers bucket
CREATE POLICY "Users can delete own covers"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);