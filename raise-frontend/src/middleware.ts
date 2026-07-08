import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/stego',
  '/profile',
  '/settings',
  '/notifications',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register'];

// Routes that are public (no redirect even if authenticated)
const publicAuthRoutes = ['/auth/forgot-password', '/auth/reset-password', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // Note: We're using client-side auth protection instead of middleware
  // because Supabase tokens are stored in localStorage which middleware can't access
  // Protected routes will check authentication on the client side
  
  // Check if route is public auth route (forgot password, reset password, callback)
  const isPublicAuthRoute = publicAuthRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Allow public auth routes without any checks
  if (isPublicAuthRoute) {
    return response;
  }
  
  // Only handle auth route redirects if we can detect a session
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Try to get session from Supabase cookies (if they exist)
  const cookies = request.cookies.getAll();
  const supabaseAuthCookie = cookies.find(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  const hasSession = !!supabaseAuthCookie?.value;

  // Only redirect away from auth routes if we have a clear session
  // This prevents redirect loops
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
