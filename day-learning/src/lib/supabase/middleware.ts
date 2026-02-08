import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createMiddlewareClient({ req: request, res: response } as any)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedPaths = ['/learn', '/onboarding', '/admin']
  const isProtected = protectedPaths.some((p) => path.startsWith(p))

  if (isProtected && !session) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect signed-in users away from auth pages
  if (path.startsWith('/auth/') && session) {
    return NextResponse.redirect(new URL('/learn', request.url))
  }

  return response
}
