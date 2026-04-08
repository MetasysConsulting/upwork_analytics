import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')

    const { data, error } = await supabase.rpc('get_overall_stats', {
      from_date: from_date || null
    })

    if (error) {
      console.error('Error fetching overall stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch overall statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data?.[0] || {} })
  } catch (error: any) {
    console.error('Error in overall-stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
