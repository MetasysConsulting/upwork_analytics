import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const authError = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')

    const { data, error } = await supabase.rpc('get_client_hourly_rate_distribution', {
      from_date: from_date || null
    })

    if (error) {
      console.error('Error fetching client hourly rate:', error)
      return NextResponse.json(
        { error: 'Failed to fetch client hourly rate metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Error in client-hourly-rate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
