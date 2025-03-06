import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekupvddxbtrlczfwjoyo.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Helper function to get cookies
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null;
        }
        
        // Try to get from localStorage first
        const localValue = window.localStorage.getItem(key);
        if (localValue) return localValue;
        
        // If not in localStorage, try cookies
        if (key === 'sb-access-token') {
          return getCookie('sb-access-token');
        }
        if (key === 'sb-refresh-token') {
          return getCookie('sb-refresh-token');
        }
        
        return null;
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
        
        // Also set as cookie for server-side access
        if (key === 'sb-access-token' || key === 'sb-refresh-token') {
          const cookieOptions = [
            'path=/',
            `max-age=${60 * 60 * 24 * 7}`, // 7 days
            'SameSite=Lax'
          ].join('; ');
          
          document.cookie = `${key}=${value}; ${cookieOptions}`;
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
        
        // Also remove from cookies
        if (key === 'sb-access-token' || key === 'sb-refresh-token') {
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  }
}); 