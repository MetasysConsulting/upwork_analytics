import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api-auth'
import type { ScrapedJob } from '@/lib/supabase'

const PAGE_SIZE = 100

// ── Fallback helpers (mirrors SQL logic, runs in Node.js) ─────────────────────

const PREMIUM_MARKETS = [
  'united states',
  ', us',
  'united kingdom',
  'canada',
  'australia',
  'saudi',
  'germany',
  'france',
  'netherlands',
  'spain',
  'italy',
  'sweden',
  'norway',
  'denmark',
  'switzerland',
  'poland',
  'belgium',
  'austria',
  'ireland',
  'portugal',
  'finland',
  'europe',
]

function isPremiumMarket(location: string | null): boolean {
  if (!location) return false
  const loc = location.toLowerCase()
  return PREMIUM_MARKETS.some((m) => loc.includes(m))
}

/** Returns the highest numeric value found in a budget string, e.g. "$20-$60" → 60, "$50/hr" → 50 */
function parseBudgetMax(budget: string | null): number {
  if (!budget) return 0
  const nums = (budget.match(/\d[\d,]*(?:\.\d+)?/g) ?? [])
    .map((v) => Number(v.replace(/,/g, '')))
    .filter((v) => !Number.isNaN(v))
  return nums.length === 0 ? 0 : Math.max(...nums)
}

function isHighProfile(job: ScrapedJob): boolean {
  return (
    isPremiumMarket(job.client_location) &&
    (Number(job.client_reviews_score ?? 0) > 4 || Number(job.client_rating ?? 0) > 4) &&
    parseBudgetMax(job.budget_amount) > 35
  )
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const offset = (page - 1) * PAGE_SIZE

    // ── Try backend RPC first (requires supabase_high_profile_setup.sql) ────────
    const [jobsResult, countResult] = await Promise.all([
      supabase.rpc('get_high_profile_jobs', {
        from_date: from_date || null,
        page_offset: offset,
        page_limit: PAGE_SIZE,
      }),
      supabase.rpc('count_high_profile_jobs', {
        from_date: from_date || null,
      }),
    ])

    // RPC worked → return directly
    if (!jobsResult.error) {
      return NextResponse.json({
        data: jobsResult.data ?? [],
        total: countResult.data ?? 0,
        source: 'rpc',
      })
    }

    // ── RPC not available — fall back to server-side JS filtering ───────────────
    // This is the same logic as the old client-side approach, but running in
    // Node.js (no browser memory constraints) with auth protection.
    // Once you run supabase_high_profile_setup.sql the RPC path takes over.
    let fallbackQuery = supabase
      .from('scraped_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000)

    if (from_date) {
      fallbackQuery = fallbackQuery.gte('created_at', from_date)
    }

    const { data: allJobs, error: fallbackError } = await fallbackQuery

    if (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: fallbackError.message },
        { status: 500 }
      )
    }

    const filtered = (allJobs ?? []).filter(isHighProfile)
    const paginated = filtered.slice(offset, offset + PAGE_SIZE)

    return NextResponse.json({
      data: paginated,
      total: filtered.length,
      source: 'fallback',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
