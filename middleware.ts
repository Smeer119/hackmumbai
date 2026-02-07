import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/auth/callback'];

// Paths that require authentication
const protectedPaths = ['/home', '/profile'];

// Check if Supabase environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // If environment variables are missing, show a warning but continue
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not set. Skipping auth checks.');
    return NextResponse.next();
  }
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // If it's not a protected path, allow access
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Create a response object that we can modify
  const res = NextResponse.next();
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });
    
    // Get the session from the cookie
    const { data: { session } } = await supabase.auth.getSession();
    
    // If there's no session and the user is trying to access a protected route
    if (!session) {
      // Save the current URL to redirect back after login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/signin';
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, redirect to sign-in page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/signin';
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure which paths the middleware will run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
