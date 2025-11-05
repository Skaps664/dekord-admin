import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_TOKEN = 'dekord_admin_secure_session_2025'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Allow login page without authentication
  if (path === '/login') {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = request.cookies.get('admin_session')

  // If no session or invalid token, redirect to login
  if (!session || session.value !== SESSION_TOKEN) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Valid session - allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/* (authentication API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
