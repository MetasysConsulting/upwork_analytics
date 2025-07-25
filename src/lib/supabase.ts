import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psegulpmbdaxhjhsfzlb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZWd1bHBtYmRheGhqaHNmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTM5MzAsImV4cCI6MjA2ODkyOTkzMH0.XvkwT_fX3JzJ8TrRFunMN-d41XWrb_V2mnpGiCfCUis'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// Type definitions for the scraped_jobs table
export interface ScrapedJob {
  id: number
  job_url: string
  job_id: string | null
  created_at: string
  updated_at: string
  title: string | null
  posted_date: string | null
  location: string | null
  description: string | null
  budget_amount: string | null
  budget_type: string | null
  experience_level: string | null
  project_type: string | null
  skills: any | null
  proposals_count: string | null
  last_viewed_by_client: string | null
  interviewing_count: string | null
  invites_sent: string | null
  unanswered_invites: string | null
  connects_required: string | null
  payment_method_verified: boolean | null
  client_rating: number | null
  client_reviews_score: number | null
  client_reviews_count: number | null
  client_location: string | null
  client_jobs_posted: string | null
  client_total_spent: string | null
  client_total_hires: string | null
  client_active_hires: string | null
  client_member_since: string | null
  client_hire_rate: string | null
  client_open_jobs: string | null
  client_avg_hourly_rate: string | null
  client_total_hours: string | null
  client_industry: string | null
  client_company_size: string | null
  client_reviews: any | null
  client_review_job_links: any | null
} 