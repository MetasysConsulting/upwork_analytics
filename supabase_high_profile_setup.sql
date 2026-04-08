-- =====================================================================
-- High Profile Jobs SQL Setup
-- Run this in the Supabase SQL editor (Settings > SQL Editor)
-- Requires: parse_numeric() from supabase_metrics_setup.sql
-- =====================================================================

-- Returns the MAXIMUM numeric value in a string, e.g. "$20-$60" → 60
-- This matches the parseBudgetMax() JS helper used in the API fallback.
CREATE OR REPLACE FUNCTION public.parse_budget_max(budget TEXT)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    (
      SELECT MAX(CAST(REGEXP_REPLACE(m[1], ',', '', 'g') AS NUMERIC))
      FROM REGEXP_MATCHES(COALESCE(budget, ''), '(\d[\d,]*(?:\.\d+)?)', 'g') AS m
    ),
    0
  );
$$;

-- Location helper to avoid repetition
-- Returns TRUE if client_location matches any premium market
CREATE OR REPLACE FUNCTION public.is_premium_market(loc TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    LOWER(COALESCE(loc, '')) LIKE '%united states%'
    OR LOWER(COALESCE(loc, '')) LIKE '%, us%'
    OR LOWER(COALESCE(loc, '')) LIKE '%united kingdom%'
    OR LOWER(COALESCE(loc, '')) LIKE '%canada%'
    OR LOWER(COALESCE(loc, '')) LIKE '%australia%'
    OR LOWER(COALESCE(loc, '')) LIKE '%saudi%'
    OR LOWER(COALESCE(loc, '')) LIKE '%germany%'
    OR LOWER(COALESCE(loc, '')) LIKE '%france%'
    OR LOWER(COALESCE(loc, '')) LIKE '%netherlands%'
    OR LOWER(COALESCE(loc, '')) LIKE '%spain%'
    OR LOWER(COALESCE(loc, '')) LIKE '%italy%'
    OR LOWER(COALESCE(loc, '')) LIKE '%sweden%'
    OR LOWER(COALESCE(loc, '')) LIKE '%norway%'
    OR LOWER(COALESCE(loc, '')) LIKE '%denmark%'
    OR LOWER(COALESCE(loc, '')) LIKE '%switzerland%'
    OR LOWER(COALESCE(loc, '')) LIKE '%poland%'
    OR LOWER(COALESCE(loc, '')) LIKE '%belgium%'
    OR LOWER(COALESCE(loc, '')) LIKE '%austria%'
    OR LOWER(COALESCE(loc, '')) LIKE '%ireland%'
    OR LOWER(COALESCE(loc, '')) LIKE '%portugal%'
    OR LOWER(COALESCE(loc, '')) LIKE '%finland%'
    OR LOWER(COALESCE(loc, '')) LIKE '%europe%'
  );
$$;

-- Paginated fetch of high-profile jobs
CREATE OR REPLACE FUNCTION public.get_high_profile_jobs(
  from_date   TIMESTAMPTZ DEFAULT NULL,
  page_offset INT         DEFAULT 0,
  page_limit  INT         DEFAULT 100
)
RETURNS SETOF public.scraped_jobs
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.scraped_jobs
  WHERE
    (from_date IS NULL OR created_at >= from_date)
    AND public.is_premium_market(client_location)
    AND (
      COALESCE(client_reviews_score, 0) > 4
      OR COALESCE(client_rating, 0) > 4
    )
    AND public.parse_budget_max(budget_amount) > 35
  ORDER BY created_at DESC
  LIMIT  page_limit
  OFFSET page_offset;
$$;

-- Total count of high-profile jobs (for pagination)
CREATE OR REPLACE FUNCTION public.count_high_profile_jobs(
  from_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.scraped_jobs
  WHERE
    (from_date IS NULL OR created_at >= from_date)
    AND public.is_premium_market(client_location)
    AND (
      COALESCE(client_reviews_score, 0) > 4
      OR COALESCE(client_rating, 0) > 4
    )
    AND public.parse_budget_max(budget_amount) > 35;
$$;

-- Grant access to both anon (for the Kinde-auth flow) and authenticated
GRANT EXECUTE ON FUNCTION public.parse_budget_max(TEXT)                       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_premium_market(TEXT)                      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_high_profile_jobs(TIMESTAMPTZ, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_high_profile_jobs(TIMESTAMPTZ)         TO anon, authenticated;
