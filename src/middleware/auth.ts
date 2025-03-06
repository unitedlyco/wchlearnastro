import { defineMiddleware } from 'astro:middleware';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Extend the Locals interface to include session and user
declare global {
  namespace App {
    interface Locals {
      session: Session | null;
      user: User | null;
    }
  }
}

// Helper function for consistent logging
function logToTerminal(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log('\x1b[36m%s\x1b[0m', `[${timestamp}] 🔒 Auth: ${message}`);
  if (data) {
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(data, null, 2));
  }
}

// Helper function to parse cookies
function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

export const onRequest = defineMiddleware(async ({ locals, request, redirect, cookies }, next) => {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie');
    const parsedCookies = parseCookies(cookieHeader);
    
    // Get tokens from cookies
    const sbAccessToken = parsedCookies['sb-access-token'] || cookies.get('sb-access-token')?.value;
    const sbRefreshToken = parsedCookies['sb-refresh-token'] || cookies.get('sb-refresh-token')?.value;

    // Get the current URL path
    const url = new URL(request.url);
    const path = url.pathname;
    
    logToTerminal('Checking auth state', {
      path: path,
      hasCookies: !!cookieHeader,
      hasAccessToken: !!sbAccessToken,
      hasRefreshToken: !!sbRefreshToken,
      cookieNames: Object.keys(parsedCookies),
      astroAccessToken: cookies.get('sb-access-token')?.value ? true : false,
      astroRefreshToken: cookies.get('sb-refresh-token')?.value ? true : false
    });
    
    // Define protected routes
    const protectedRoutes = ['/dashboard'];
    const authRoutes = ['/signin', '/signup'];
    
    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const isAuthRoute = authRoutes.some(route => path.startsWith(route));

    let session = null;

    // Try to get session from tokens if available
    if (sbAccessToken && sbRefreshToken) {
      try {
        logToTerminal('Attempting to set session from tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: sbAccessToken,
          refresh_token: sbRefreshToken,
        });
        
        if (!error && data?.session) {
          session = data.session;
          
          // Ensure cookies are set in Astro's cookie store
          cookies.set('sb-access-token', session.access_token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: url.protocol === 'https:',
            httpOnly: false // Allow client-side access
          });
          
          cookies.set('sb-refresh-token', session.refresh_token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: url.protocol === 'https:',
            httpOnly: false // Allow client-side access
          });
          
          logToTerminal('Session set successfully', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(session.expires_at! * 1000).toISOString(),
            cookiesSet: true
          });
        } else if (error) {
          logToTerminal('Error setting session', { 
            error: error.message
          });
        }
      } catch (err) {
        logToTerminal('Exception setting session', { 
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // If no session from tokens, try to get current session
    if (!session) {
      logToTerminal('Attempting to get current session');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (!error && currentSession) {
        session = currentSession;
        
        // Ensure cookies are set in Astro's cookie store
        cookies.set('sb-access-token', session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: url.protocol === 'https:',
          httpOnly: false // Allow client-side access
        });
        
        cookies.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: url.protocol === 'https:',
          httpOnly: false // Allow client-side access
        });
        
        logToTerminal('Got current session', {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: new Date(session.expires_at! * 1000).toISOString(),
          cookiesSet: true
        });
      } else if (error) {
        logToTerminal('Error getting current session', { error: error.message });
      }
    }
    
    // Log final auth state
    logToTerminal('Auth state summary', {
      path,
      isProtectedRoute,
      isAuthRoute,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      emailConfirmed: session?.user?.email_confirmed_at ? true : false
    });

    // If the route is protected and the user is not authenticated, redirect to signin
    if (isProtectedRoute && (!session || !session.access_token)) {
      logToTerminal('No valid session, redirecting to signin');
      return redirect('/signin');
    }

    // If the route is protected and the user's email is not verified, redirect to verify-email
    if (isProtectedRoute && session?.user && !session.user.email_confirmed_at) {
      logToTerminal('Email not verified, redirecting to verify-email');
      return redirect('/verify-email');
    }
    
    // If the user is authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && session?.access_token) {
      logToTerminal('User authenticated, redirecting to dashboard');
      return redirect('/dashboard');
    }
    
    // Set the session in locals for use in routes
    locals.session = session;
    locals.user = session?.user ?? null;
    
    return next();
  } catch (err) {
    logToTerminal('Unexpected error in middleware', { 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return next();
  }
}); 