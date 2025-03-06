import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Extend the Locals interface to include session, user and displayName
declare global {
  namespace App {
    interface Locals {
      session: Session | null;
      user: User | null;
      displayName: string | null;
    }
  }
}

// Helper function for consistent logging
function logToTerminal(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log('\x1b[36m%s\x1b[0m', `[${timestamp}] 🔒 Root Middleware: ${message}`);
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

// Helper function to get display name from user
function getDisplayName(user: User | null): string | null {
  if (!user) return null;
  
  // Check if user has a display name in metadata
  if (user.user_metadata && user.user_metadata.display_name) {
    return user.user_metadata.display_name;
  }
  
  // Check if user has a name in metadata
  if (user.user_metadata && user.user_metadata.name) {
    return user.user_metadata.name;
  }
  
  // Check if user has a full_name in metadata
  if (user.user_metadata && user.user_metadata.full_name) {
    return user.user_metadata.full_name;
  }
  
  // Fall back to email username
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return null;
}

export const onRequest = defineMiddleware(async ({ locals, request, redirect, cookies }, next) => {
  try {
    // Get the current URL path
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie');
    const parsedCookies = parseCookies(cookieHeader);
    
    // Get tokens from cookies
    const sbAccessToken = parsedCookies['sb-access-token'] || cookies.get('sb-access-token')?.value;
    const sbRefreshToken = parsedCookies['sb-refresh-token'] || cookies.get('sb-refresh-token')?.value;

    logToTerminal('Request info', {
      path,
      method: request.method,
      hasCookies: !!cookieHeader,
      hasAccessToken: !!sbAccessToken,
      hasRefreshToken: !!sbRefreshToken,
      cookieNames: Object.keys(parsedCookies)
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
            expiresAt: new Date(session.expires_at! * 1000).toISOString()
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
          expiresAt: new Date(session.expires_at! * 1000).toISOString()
        });
      } else if (error) {
        logToTerminal('Error getting current session', { error: error.message });
      }
    }
    
    // Get display name from user
    const displayName = getDisplayName(session?.user ?? null);
    
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
      displayName
    });

    // Set the session in locals for use in routes
    locals.session = session;
    locals.user = session?.user ?? null;
    locals.displayName = displayName;
    
    // Handle protected routes
    if (isProtectedRoute) {
      if (!session || !session.access_token) {
        logToTerminal('No valid session, redirecting to signin');
        return redirect('/signin');
      }
      
      logToTerminal('User authenticated, proceeding to protected route');
    }
    
    // Handle auth routes (signin/signup)
    if (isAuthRoute && session?.access_token) {
      logToTerminal('User already authenticated, redirecting to dashboard');
      return redirect('/dashboard');
    }
    
    // Proceed with the request
    return next();
  } catch (err) {
    logToTerminal('Unexpected error in middleware', { 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return next();
  }
}); 