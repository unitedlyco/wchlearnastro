import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Get session data from request
    const body = await request.json();
    const { session } = body;
    
    if (!session || !session.access_token || !session.refresh_token) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid session data'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Set cookies with proper attributes
    cookies.set('sb-access-token', session.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: request.url.startsWith('https'),
      httpOnly: false // Allow client-side access
    });
    
    cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: request.url.startsWith('https'),
      httpOnly: false // Allow client-side access
    });
    
    // Log the cookie setting
    console.log(`[${new Date().toISOString()}] 🍪 Auth: Set cookies for user session`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Session cookies set successfully'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in signin API:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 