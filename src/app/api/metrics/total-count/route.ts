import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const authError = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')

    const totalQuery = supabase
      .from('scraped_jobs')
      .select('id', { count: 'exact', head: true })

    const completeQuery = supabase
      .from('scraped_jobs')
      .select('id', { count: 'exact', head: true })
      .not('title', 'is', null)
      .not('client_location', 'is', null)
      .not('budget_amount', 'is', null)

    const [totalResult, completeResult] = await Promise.all([
      from_date ? totalQuery.gte('created_at', from_date) : totalQuery,
      from_date ? completeQuery.gte('created_at', from_date) : completeQuery
    ])

    if (totalResult.error || completeResult.error) {
      console.error('Error fetching job counts:', totalResult.error || completeResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch job counts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      total: totalResult.count || 0,
      complete: completeResult.count || 0
    })
  } catch (error: any) {
    console.error('Error in total-count API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
