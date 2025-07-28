import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return res
  }
  
  const isRSC = request.nextUrl.search?.includes('_rsc=') || false
  if (isRSC) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    const authCookie = request.cookies.get('sb-auth-token')?.value ||
                      request.cookies.get('supabase-auth-token')?.value ||
                      request.cookies.get('sb-refresh-token')?.value ||
                      request.cookies.get('supabase-refresh-token')?.value
    
    if (!session && !authCookie) {
      console.log('No session or auth cookies found, redirecting to home')
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('auth', 'required')
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
