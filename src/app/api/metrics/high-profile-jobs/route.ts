import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api-auth'

const PAGE_SIZE = 100

export async function GET(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const offset = (page - 1) * PAGE_SIZE

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

    if (jobsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch high-profile jobs', details: jobsResult.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: jobsResult.data ?? [],
      total: countResult.data ?? 0,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
