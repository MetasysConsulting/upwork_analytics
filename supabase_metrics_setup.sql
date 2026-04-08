-- Supabase SQL for scalable analytics with time-range support.
-- Run this in Supabase SQL Editor.

CREATE OR REPLACE VIEW complete_jobs AS
SELECT *
FROM scraped_jobs
WHERE title IS NOT NULL
  AND client_location IS NOT NULL
  AND budget_amount IS NOT NULL;

-- Helper: extract first numeric token from text (e.g. "$1,200+" -> 1200)
CREATE OR REPLACE FUNCTION parse_numeric(input_text TEXT)
RETURNS NUMERIC AS $$
DECLARE
  cleaned TEXT;
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;

  cleaned := NULLIF(REGEXP_REPLACE(input_text, '[^0-9.]', '', 'g'), '');
  IF cleaned IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN cleaned::NUMERIC;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_jobs_over_time(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  date DATE,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) AS date,
    COUNT(*)::BIGINT AS job_count
  FROM complete_jobs
  WHERE from_date IS NULL OR created_at >= from_date
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_budget_analysis(
  from_date TIMESTAMPTZ DEFAULT NULL,
  budget_mode TEXT DEFAULT 'all'
)
RETURNS TABLE (
  budget_range TEXT,
  job_count BIGINT,
  avg_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH parsed AS (
    SELECT
      cj.budget_type,
      cj.budget_amount,
      nums.values AS numeric_values
    FROM complete_jobs cj
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG((m[1])::NUMERIC) AS values
      FROM regexp_matches(
        regexp_replace(COALESCE(cj.budget_amount, ''), ',', '', 'g'),
        '([0-9]+(?:\.[0-9]+)?)',
        'g'
      ) AS m
    ) nums ON TRUE
    WHERE cj.budget_amount IS NOT NULL
      AND trim(cj.budget_amount) <> ''
      AND (from_date IS NULL OR cj.created_at >= from_date)
      AND (
        budget_mode = 'all'
        OR (budget_mode = 'fixed' AND (cj.budget_type IS NULL OR cj.budget_type NOT ILIKE 'hourly'))
        OR (budget_mode = 'hourly' AND cj.budget_type ILIKE 'hourly')
      )
  ),
  normalized AS (
    SELECT
      budget_type,
      CASE
        WHEN numeric_values IS NULL OR array_length(numeric_values, 1) IS NULL THEN NULL
        ELSE numeric_values[array_length(numeric_values, 1)]
      END AS amount
    FROM parsed
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN amount IS NULL THEN 'Unknown'
        WHEN budget_type ILIKE 'hourly' AND amount < 15 THEN 'Hourly: < $15/hr'
        WHEN budget_type ILIKE 'hourly' AND amount < 25 THEN 'Hourly: $15-$25/hr'
        WHEN budget_type ILIKE 'hourly' AND amount < 40 THEN 'Hourly: $25-$40/hr'
        WHEN budget_type ILIKE 'hourly' AND amount < 60 THEN 'Hourly: $40-$60/hr'
        WHEN budget_type ILIKE 'hourly' THEN 'Hourly: $60+/hr'
        WHEN amount < 100 THEN 'Fixed: < $100'
        WHEN amount < 500 THEN 'Fixed: $100-$500'
        WHEN amount < 1000 THEN 'Fixed: $500-$1,000'
        WHEN amount < 5000 THEN 'Fixed: $1,000-$5,000'
        ELSE 'Fixed: $5,000+'
      END AS budget_range,
      amount
    FROM normalized
  )
  SELECT
    bucketed.budget_range,
    COUNT(*)::BIGINT AS job_count,
    AVG(amount) AS avg_budget
  FROM bucketed
  GROUP BY bucketed.budget_range
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_skills_demand(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  skill TEXT,
  demand_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH skills_expanded AS (
    SELECT
      UNNEST(
        CASE
          WHEN skills::TEXT LIKE '[%' THEN ARRAY(SELECT jsonb_array_elements_text(skills::jsonb))
          ELSE ARRAY(SELECT TRIM(UNNEST(STRING_TO_ARRAY(skills::TEXT, ','))))
        END
      ) AS skill_name
    FROM complete_jobs
    WHERE skills IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  )
  SELECT
    TRIM(skill_name)::TEXT AS skill,
    COUNT(*)::BIGINT AS demand_count
  FROM skills_expanded
  WHERE TRIM(skill_name) <> ''
  GROUP BY TRIM(skill_name)
  ORDER BY demand_count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_countries(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  country TEXT,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    client_location AS country,
    COUNT(*)::BIGINT AS job_count
  FROM complete_jobs
  WHERE client_location IS NOT NULL
    AND (from_date IS NULL OR created_at >= from_date)
  GROUP BY client_location
  ORDER BY job_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_activity(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  date DATE,
  hour INTEGER,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) AS date,
    EXTRACT(HOUR FROM created_at)::INTEGER AS hour,
    COUNT(*)::BIGINT AS job_count
  FROM complete_jobs
  WHERE from_date IS NULL OR created_at >= from_date
  GROUP BY DATE(created_at), EXTRACT(HOUR FROM created_at)
  ORDER BY date DESC, hour;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_activity_scatter(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  jobs_posted INTEGER,
  total_spent NUMERIC,
  location TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(parse_numeric(client_jobs_posted), 0)::INTEGER AS jobs_posted,
    COALESCE(parse_numeric(client_total_spent), 0) AS total_spent,
    COALESCE(client_location, 'Unknown')::TEXT AS location
  FROM complete_jobs
  WHERE client_jobs_posted IS NOT NULL
    AND client_total_spent IS NOT NULL
    AND (from_date IS NULL OR created_at >= from_date)
    AND COALESCE(parse_numeric(client_jobs_posted), 0) > 0
    AND COALESCE(parse_numeric(client_total_spent), 0) > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_spending_distribution(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  tier_label TEXT,
  client_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT parse_numeric(client_total_spent) AS spent
    FROM complete_jobs
    WHERE client_total_spent IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN spent >= 1 AND spent < 1000 THEN 'Starter ($1-$1K)'
        WHEN spent >= 1000 AND spent < 5000 THEN 'Growing ($1K-$5K)'
        WHEN spent >= 5000 AND spent < 25000 THEN 'Established ($5K-$25K)'
        WHEN spent >= 25000 AND spent < 100000 THEN 'Corporate ($25K-$100K)'
        WHEN spent >= 100000 THEN 'Enterprise ($100K+)'
        ELSE NULL
      END AS tier_label
    FROM base
  )
  SELECT
    bucketed.tier_label,
    COUNT(*)::BIGINT AS client_count
  FROM bucketed
  WHERE bucketed.tier_label IS NOT NULL
  GROUP BY bucketed.tier_label
  ORDER BY client_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_hire_rate_distribution(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  range_label TEXT,
  client_count BIGINT,
  avg_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT parse_numeric(client_hire_rate) AS rate
    FROM complete_jobs
    WHERE client_hire_rate IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN rate >= 0 AND rate < 20 THEN 'Very Low (0-20%)'
        WHEN rate >= 20 AND rate < 40 THEN 'Low (20-40%)'
        WHEN rate >= 40 AND rate < 60 THEN 'Medium (40-60%)'
        WHEN rate >= 60 AND rate < 80 THEN 'High (60-80%)'
        WHEN rate >= 80 THEN 'Excellent (80%+)'
        ELSE NULL
      END AS range_label,
      rate
    FROM base
  )
  SELECT
    bucketed.range_label,
    COUNT(*)::BIGINT AS client_count,
    AVG(rate) AS avg_rate
  FROM bucketed
  WHERE bucketed.range_label IS NOT NULL
  GROUP BY bucketed.range_label
  ORDER BY client_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_hourly_rate_distribution(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  range_label TEXT,
  job_count BIGINT,
  avg_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT parse_numeric(budget_amount) AS rate
    FROM complete_jobs
    WHERE budget_type ILIKE 'hourly'
      AND budget_amount IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN rate >= 5 AND rate < 15 THEN '$5-$15'
        WHEN rate >= 15 AND rate < 25 THEN '$15-$25'
        WHEN rate >= 25 AND rate < 35 THEN '$25-$35'
        WHEN rate >= 35 AND rate < 50 THEN '$35-$50'
        WHEN rate >= 50 AND rate < 75 THEN '$50-$75'
        WHEN rate >= 75 THEN '$75+'
        ELSE NULL
      END AS range_label,
      rate
    FROM base
  )
  SELECT
    bucketed.range_label,
    COUNT(*)::BIGINT AS job_count,
    AVG(rate) AS avg_rate
  FROM bucketed
  WHERE bucketed.range_label IS NOT NULL
  GROUP BY bucketed.range_label
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_connects_required_distribution(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  range_label TEXT,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT parse_numeric(connects_required) AS connects
    FROM complete_jobs
    WHERE connects_required IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN connects >= 1 AND connects <= 5 THEN 'Low (1-5)'
        WHEN connects >= 6 AND connects <= 10 THEN 'Medium (6-10)'
        WHEN connects >= 11 AND connects <= 15 THEN 'High (11-15)'
        WHEN connects >= 16 AND connects <= 20 THEN 'Very High (16-20)'
        WHEN connects >= 21 THEN 'Premium (21+)'
        ELSE NULL
      END AS range_label
    FROM base
  )
  SELECT
    bucketed.range_label,
    COUNT(*)::BIGINT AS job_count
  FROM bucketed
  WHERE bucketed.range_label IS NOT NULL
  GROUP BY bucketed.range_label
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_interviewing_rate_distribution(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  range_label TEXT,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT parse_numeric(interviewing_count) AS interview_count
    FROM complete_jobs
    WHERE interviewing_count IS NOT NULL
      AND (from_date IS NULL OR created_at >= from_date)
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN interview_count = 0 THEN 'No Interviews (0)'
        WHEN interview_count >= 1 AND interview_count <= 3 THEN 'Low Activity (1-3)'
        WHEN interview_count >= 4 AND interview_count <= 8 THEN 'Moderate (4-8)'
        WHEN interview_count >= 9 AND interview_count <= 15 THEN 'High Activity (9-15)'
        WHEN interview_count >= 16 THEN 'Very Active (16+)'
        ELSE NULL
      END AS range_label
    FROM base
  )
  SELECT
    bucketed.range_label,
    COUNT(*)::BIGINT AS job_count
  FROM bucketed
  WHERE bucketed.range_label IS NOT NULL
  GROUP BY bucketed.range_label
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_posting_heatmap(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  day_of_week INTEGER,
  hour INTEGER,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM created_at)::INTEGER AS day_of_week,
    EXTRACT(HOUR FROM created_at)::INTEGER AS hour,
    COUNT(*)::BIGINT AS job_count
  FROM complete_jobs
  WHERE from_date IS NULL OR created_at >= from_date
  GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
  ORDER BY day_of_week, hour;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_overall_stats(from_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  total_jobs BIGINT,
  total_complete_jobs BIGINT,
  avg_client_rating NUMERIC,
  total_client_spending TEXT,
  avg_hourly_rate NUMERIC,
  total_connects_required BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM scraped_jobs WHERE from_date IS NULL OR created_at >= from_date) AS total_jobs,
    (SELECT COUNT(*)::BIGINT FROM complete_jobs WHERE from_date IS NULL OR created_at >= from_date) AS total_complete_jobs,
    (SELECT AVG(client_rating) FROM complete_jobs WHERE client_rating IS NOT NULL AND (from_date IS NULL OR created_at >= from_date)) AS avg_client_rating,
    (SELECT SUM(COALESCE(parse_numeric(client_total_spent), 0))::TEXT FROM complete_jobs WHERE client_total_spent IS NOT NULL AND (from_date IS NULL OR created_at >= from_date)) AS total_client_spending,
    (SELECT AVG(COALESCE(parse_numeric(client_avg_hourly_rate), 0)) FROM complete_jobs WHERE client_avg_hourly_rate IS NOT NULL AND (from_date IS NULL OR created_at >= from_date)) AS avg_hourly_rate,
    (SELECT SUM(COALESCE(parse_numeric(connects_required), 0))::BIGINT FROM complete_jobs WHERE connects_required IS NOT NULL AND (from_date IS NULL OR created_at >= from_date)) AS total_connects_required;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_total_job_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::BIGINT FROM scraped_jobs);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_total_complete_job_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::BIGINT FROM complete_jobs);
END;
$$ LANGUAGE plpgsql;
