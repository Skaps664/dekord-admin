import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'

  // Get authentication status from cookie or header
  // For now, we'll check localStorage in the client side
  // In production, use proper JWT tokens in httpOnly cookies
  
  // If user is on login page and authenticated, redirect to dashboard
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For all other pages, check authentication on client side
  // The actual auth check will happen in the layout component
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
