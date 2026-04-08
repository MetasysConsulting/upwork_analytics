# Backend Metrics Setup Guide

This application now uses **backend-aggregated metrics** calculated in Supabase with a `from_date` parameter for range filtering. This provides better performance, avoids API row-limit issues, and allows analytics on ALL matching jobs in the database.

## Setup Instructions

### Step 1: Run SQL in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_metrics_setup.sql`
4. Click **Run** to execute the SQL

This will create:
- A view for complete jobs
- Database functions for each metric type (all support `from_date`):
  - `get_jobs_over_time()` - Jobs posted over time
  - `get_budget_analysis()` - Budget distribution analysis
  - `get_skills_demand()` - Top skills in demand
  - `get_client_countries()` - Client locations
  - `get_client_activity()` - Job posting heatmap data
  - `get_client_activity_scatter()` - Client activity scatter data
  - `get_client_spending_distribution()` - Client spending tiers
  - `get_client_hire_rate_distribution()` - Hire-rate bands
  - `get_client_hourly_rate_distribution()` - Hourly-rate bands
  - `get_connects_required_distribution()` - Connects ranges
  - `get_interviewing_rate_distribution()` - Interview ranges
  - `get_posting_heatmap()` - Day/hour heatmap bins
  - `get_overall_stats()` - Overall statistics

### Step 2: Verify Functions

After running the SQL, verify the functions exist:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE 'get_%' OR routine_name = 'parse_numeric');
```

You should see all analytics functions listed.

### Step 3: Test the API Routes

The Next.js API routes are already set up at:
- `/api/metrics/jobs-over-time`
- `/api/metrics/budget-analysis`
- `/api/metrics/skills-demand`
- `/api/metrics/client-countries`
- `/api/metrics/client-activity`
- `/api/metrics/client-activity-scatter`
- `/api/metrics/client-spending`
- `/api/metrics/client-hire-rate`
- `/api/metrics/client-hourly-rate`
- `/api/metrics/connects-required`
- `/api/metrics/interview-rate`
- `/api/metrics/posting-heatmap`
- `/api/metrics/overall-stats`

All routes support `?from_date=<ISO timestamp>` (for example: `?from_date=2026-01-01T00:00:00.000Z`).

### Step 4: Update Chart Components

Chart components are being updated to use the new API endpoints instead of receiving all jobs as props. The following charts have been updated:
- ✅ JobsOverTimeChart
- ✅ SkillsDemandChart
- ⏳ BudgetAnalysisChart (in progress)
- ⏳ ClientCountriesChart (in progress)
- ⏳ Other charts (to be updated)

## Benefits

1. **Performance**: Only aggregated data is sent to frontend (KB instead of MB)
2. **Scalability**: Works with millions of jobs without performance issues
3. **Real-time**: Metrics are calculated on-demand from the latest data
4. **Efficiency**: Database does the heavy lifting, not the browser

## How It Works

1. Frontend requests metrics from Next.js API routes
2. API routes call Supabase database functions
3. Database functions calculate aggregations on ALL jobs
4. Only the aggregated results are returned to frontend
5. Charts render the pre-calculated metrics

## Troubleshooting

If metrics don't load:
1. Verify SQL functions were created successfully
2. Check Supabase logs for any errors
3. Verify your Supabase connection in `.env`
4. Check browser console for API errors
