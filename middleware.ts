import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is accessing a protected route
  const protectedPaths = ['/', '/api/violations']
  const path = request.nextUrl.pathname

  // Allow auth pages without authentication
  if (path.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(protectedPath + '/')
  )

  if (isProtectedPath) {
    // Check for authentication in cookies
    const authenticated = request.cookies.get('authenticated')?.value

    if (!authenticated) {
      // Redirect to login page
      const loginUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
