import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAuthApi = request.nextUrl.pathname === '/api/auth'
  
  // Tillat API-kall til auth endepunkt
  if (isAuthApi) {
    return NextResponse.next()
  }
  
  // Hvis ikke autentisert og ikke på login-siden, redirect til login
  if (authCookie?.value !== 'authenticated' && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Hvis allerede autentisert og på login-siden, redirect til hovedsiden
  if (authCookie?.value === 'authenticated' && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}

