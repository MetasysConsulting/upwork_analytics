import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Returns a 401 NextResponse if the request does not carry a valid Kinde session.
 * Returns null when the caller is authenticated and may proceed.
 *
 * Usage inside a route handler:
 *   const authError = await requireAuth()
 *   if (authError) return authError
 */
export async function requireAuth(): Promise<NextResponse | null> {
  try {
    const { isAuthenticated } = getKindeServerSession()
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return null
  } catch {
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 401 })
  }
}
