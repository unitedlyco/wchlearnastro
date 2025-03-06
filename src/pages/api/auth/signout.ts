import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log(`[${new Date().toISOString()}] 🚪 Auth: Signing out user`);
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ Auth: Error signing out:`, error.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Clear cookies
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    // Return a script that clears localStorage and client-side cookies before redirecting
    return new Response(
      `
      <html>
        <head>
          <title>Signing out...</title>
        </head>
        <body>
          <p>Signing out...</p>
          <script>
            // Clear localStorage
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('sb-refresh-token');
            
            // Clear cookies
            document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // Dispatch auth state change event
            window.dispatchEvent(new CustomEvent('auth-state-change'));
            
            // Redirect to home page
            window.location.href = '/';
          </script>
        </body>
      </html>
      `,
      { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Auth: Unexpected error during signout:`, 
      error instanceof Error ? error.message : 'Unknown error');
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 