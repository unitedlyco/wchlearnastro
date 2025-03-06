import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie');
    const parsedCookies: Record<string, string> = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          parsedCookies[name] = decodeURIComponent(value);
        }
      });
    }
    
    // Get tokens from cookies
    const sbAccessToken = parsedCookies['sb-access-token'] || cookies.get('sb-access-token')?.value;
    const sbRefreshToken = parsedCookies['sb-refresh-token'] || cookies.get('sb-refresh-token')?.value;
    
    // Check session
    let sessionInfo = null;
    let sessionError = null;
    
    if (sbAccessToken && sbRefreshToken) {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: sbAccessToken,
          refresh_token: sbRefreshToken,
        });
        
        if (!error && data?.session) {
          sessionInfo = {
            userId: data.session.user.id,
            email: data.session.user.email,
            expiresAt: new Date(data.session.expires_at! * 1000).toISOString()
          };
        } else if (error) {
          sessionError = error.message;
        }
      } catch (err) {
        sessionError = err instanceof Error ? err.message : 'Unknown error';
      }
    }
    
    // Get current session
    const { data: { session: currentSession }, error: currentSessionError } = await supabase.auth.getSession();
    
    // Get all cookie names from Astro cookies
    const astroCookieNames: string[] = [];
    for (const [name] of Object.entries(cookies)) {
      if (typeof name === 'string') {
        astroCookieNames.push(name);
      }
    }
    
    // Compile debug info
    const debugInfo = {
      timestamp: new Date().toISOString(),
      request: {
        url: request.url,
        method: request.method,
        headers: {
          cookie: cookieHeader ? true : false,
          // Include other relevant headers
        }
      },
      cookies: {
        parsed: Object.keys(parsedCookies),
        astroCookies: astroCookieNames,
        hasAccessToken: !!sbAccessToken,
        hasRefreshToken: !!sbRefreshToken
      },
      session: {
        fromTokens: sessionInfo,
        tokenError: sessionError,
        current: currentSession ? {
          userId: currentSession.user.id,
          email: currentSession.user.email,
          expiresAt: new Date(currentSession.expires_at! * 1000).toISOString()
        } : null,
        currentError: currentSessionError ? currentSessionError.message : null
      }
    };
    
    return new Response(
      JSON.stringify(debugInfo, null, 2),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, null, 2),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 