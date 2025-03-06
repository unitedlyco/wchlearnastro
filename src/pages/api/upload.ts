// Upload API Endpoint
// ---------------
// Description: Handles file uploads, particularly for profile photos

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Helper function for server-side logging
function logToTerminal(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log('\x1b[34m%s\x1b[0m', `[${timestamp}] 📤 Upload API: ${message}`);
  if (data) {
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(data, null, 2));
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    const { user, session } = locals;
    
    if (!user || !session?.access_token) {
      logToTerminal('Unauthorized upload attempt');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'You must be logged in to upload files' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      logToTerminal('No file provided');
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'No file provided' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!type) {
      logToTerminal('No file type specified');
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'File type not specified' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      logToTerminal('Invalid file type', { fileType: file.type });
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Only image files are allowed' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      logToTerminal('File too large', { fileSize: file.size });
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'File size exceeds the 2MB limit for profile photos' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up storage client with user's session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    
    // Generate a unique filename with user ID prefix
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatar')  // Use the correct bucket name
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      logToTerminal('Error uploading to storage', { error });
      // Log additional details for debugging
      logToTerminal('Upload attempt details', {
        bucket: 'avatar',  // Update bucket name in logs
        fileName,
        contentType: file.type,
        userId: user.id,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token
      });
      return new Response(
        JSON.stringify({ 
          error: 'Storage Error', 
          message: error.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrl } = supabase.storage
      .from('avatar')  // Use the same bucket name
      .getPublicUrl(fileName);
    
    logToTerminal('File uploaded successfully', { 
      userId: user.id,
      fileType: file.type,
      fileSize: file.size,
      path: data?.path,
      publicUrl: publicUrl?.publicUrl
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl.publicUrl
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