import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')

    const { data, error } = await supabase.rpc('get_interviewing_rate_distribution', {
      from_date: from_date || null
    })

    if (error) {
      console.error('Error fetching interview rate:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interview rate metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Error in interview-rate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
