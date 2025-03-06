import type { APIRoute } from 'astro';

export const prerender = false;

// Helper function for consistent logging
function logToTerminal(type: string, data: any) {
  const timestamp = new Date().toISOString();
  let color = '\x1b[35m'; // Default magenta
  let emoji = '📝';

  switch (type) {
    case 'signin-attempt':
      color = '\x1b[36m'; // Cyan
      emoji = '🔑';
      break;
    case 'signin-success':
      color = '\x1b[32m'; // Green
      emoji = '✅';
      break;
    case 'storage-check':
      color = '\x1b[33m'; // Yellow
      emoji = '💾';
      break;
    case 'error':
      color = '\x1b[31m'; // Red
      emoji = '❌';
      break;
  }

  console.log(`${color}[${timestamp}] ${emoji} ${type.toUpperCase()}\x1b[0m`);
  console.log('\x1b[90m%s\x1b[0m', JSON.stringify(data, null, 2));
  console.log('\x1b[90m%s\x1b[0m', '-'.repeat(80));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, data } = body;

    logToTerminal(type, data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logToTerminal('error', { 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 