// Profile Update API Endpoint
// ----------------------
// Description: Handles user profile updates

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

// Helper function for server-side logging
function logToTerminal(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log('\x1b[34m%s\x1b[0m', `[${timestamp}] 👤 Profile API: ${message}`);
  if (data) {
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(data, null, 2));
  }
}

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Check if user is authenticated
    const { user, session } = locals;
    
    if (!user || !session?.access_token) {
      logToTerminal('Unauthorized profile update attempt');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'You must be logged in to update your profile' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const displayName = formData.get('display_name') as string;
    const avatarUrl = formData.get('avatar_url') as string;
    
    if (!displayName) {
      logToTerminal('No display name provided');
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Display name is required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up the Supabase client with the user's session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    
    // Prepare user metadata update
    const metadata: { display_name: string; avatar_url?: string } = {
      ...user.user_metadata, // Keep existing metadata
      display_name: displayName,
    };
    
    // Add avatar URL if provided
    if (avatarUrl) {
      metadata.avatar_url = avatarUrl;
    }
    
    // Update user metadata using the user's own session
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) {
      logToTerminal('Error updating user profile', { error });
      return new Response(
        JSON.stringify({ 
          error: 'Update Error', 
          message: error.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the updated session
    const { data: newSession, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logToTerminal('Error getting updated session', { sessionError });
    } else if (newSession?.session) {
      // Update session cookies with the new session data
      cookies.set('sb-access-token', newSession.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
      cookies.set('sb-refresh-token', newSession.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    }
    
    logToTerminal('Profile updated successfully', { 
      userId: user.id, 
      metadata: data?.user?.user_metadata 
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile updated successfully',
        user: {
          id: data?.user?.id,
          email: data?.user?.email,
          display_name: data?.user?.user_metadata?.display_name,
          avatar_url: data?.user?.user_metadata?.avatar_url
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    logToTerminal('Unexpected error', { error });
    return new Response(
      JSON.stringify({ 
        error: 'Server Error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 