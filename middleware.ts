import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
//import { jwtVerify } from 'jose'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup'
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value || ''
  
  // If user is on public path and has token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }
  
  // If user is on protected path and has no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}