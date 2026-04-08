import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const authError = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const from_date = searchParams.get('from_date')

    const { data, error } = await supabase.rpc('get_skills_demand', {
      from_date: from_date || null
    })

    if (error) {
      console.error('Supabase RPC error:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
      return NextResponse.json(
        { 
          error: 'Failed to fetch skills demand metrics',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Skills demand data received:', data?.length || 0, 'items')
    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Exception in skills-demand API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
