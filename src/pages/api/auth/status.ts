import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get the session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ 
          authenticated: false,
          user: null
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Set the session
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    if (error || !data.session) {
      // Clear cookies if session is invalid
      cookies.delete('sb-access-token', { path: '/' });
      cookies.delete('sb-refresh-token', { path: '/' });
      
      return new Response(
        JSON.stringify({ 
          authenticated: false,
          user: null,
          error: error?.message
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        authenticated: true,
        user: data.session.user
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        authenticated: false,
        user: null,
        error: 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 