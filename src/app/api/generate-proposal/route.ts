import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

// Simple in-memory rate limiter: max 5 requests per IP per minute
// Note: resets on cold starts in serverless environments (best-effort protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }

  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before generating another proposal.' },
      { status: 429 }
    )
  }

  try {
    const { jobDetails } = await request.json()

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const prompt = `You are an expert freelancer writing a compelling proposal for an Upwork job. Based on the following job details, write a professional, personalized proposal that:

1. Addresses the client's specific needs
2. Highlights relevant skills and experience
3. Shows understanding of the project
4. Is concise but comprehensive (2-3 paragraphs)
5. Includes a clear call to action

Job Details:
Title: ${jobDetails.title || 'N/A'}
Description: ${jobDetails.description || 'N/A'}
Budget: ${jobDetails.budget_amount || 'N/A'} ${jobDetails.budget_type || ''}
Experience Level Required: ${jobDetails.experience_level || 'N/A'}
Skills Required: ${Array.isArray(jobDetails.skills) ? jobDetails.skills.join(', ') : jobDetails.skills || 'N/A'}
Location: ${jobDetails.location || 'N/A'}
Client Location: ${jobDetails.client_location || 'N/A'}

Write a compelling proposal that stands out:`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert freelancer who writes compelling, personalized Upwork proposals that win projects.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Failed to generate proposal', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const proposal = data.choices[0]?.message?.content || 'Failed to generate proposal'

    return NextResponse.json({ proposal })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
