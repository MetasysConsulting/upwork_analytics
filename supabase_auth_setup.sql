-- Supabase auth allowlist setup for dashboard access
-- Run this once in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.authorized_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep stored emails normalized
UPDATE public.authorized_users
SET email = LOWER(TRIM(email))
WHERE email <> LOWER(TRIM(email));

ALTER TABLE public.authorized_users
  ADD CONSTRAINT authorized_users_email_lower_chk
  CHECK (email = LOWER(TRIM(email)));

ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only read their own allowlist row
DROP POLICY IF EXISTS "authorized_users_select_self" ON public.authorized_users;
CREATE POLICY "authorized_users_select_self"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (email = LOWER((auth.jwt() ->> 'email')::TEXT));

-- No anonymous reads
REVOKE ALL ON public.authorized_users FROM anon;
GRANT SELECT ON public.authorized_users TO authenticated;

-- Safe boolean check for allowlist lookups (works with anon/Kinde frontend calls).
-- SECURITY DEFINER allows function to read table without exposing rows directly.
CREATE OR REPLACE FUNCTION public.is_email_authorized(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized TEXT;
  exists_row BOOLEAN;
BEGIN
  normalized := LOWER(TRIM(COALESCE(p_email, '')));
  IF normalized = '' THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_users au
    WHERE au.email = normalized
  ) INTO exists_row;

  RETURN exists_row;
END;
$$;

REVOKE ALL ON FUNCTION public.is_email_authorized(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_email_authorized(TEXT) TO anon, authenticated;

-- Add your allowed users here (edit list as needed)
-- INSERT INTO public.authorized_users (email, note) VALUES
-- ('you@example.com', 'Owner');
