import { createClient } from '@supabase/supabase-js';

/**
 * Civix Supabase Resilience Layer
 * Designed to prevent application crashes even if environment variables are missing.
 */

const getEnv = (key) => {
  if (typeof process !== 'undefined' && process?.env?.[key]) return process.env[key];
  if (import.meta.env?.[key]) return import.meta.env[key];
  return null;
};

// Check for both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) naming conventions
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

let supabaseClient;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} catch (e) {
  console.error("SUPABASE_INIT_CRITICAL: Systems operating on local-only protocols.", e);
  // Mock client if initialization fails to prevent top-level crashes
  supabaseClient = {
    auth: { 
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase offline' } }),
      signOut: async () => {}
    },
    from: () => ({ select: () => ({ order: () => ({ data: [], error: null }), single: () => ({ data: null, error: null }) }), insert: () => ({ error: null }), update: () => ({ eq: () => ({ error: null }) }) }),
    storage: { from: () => ({ upload: async () => ({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {}
  };
}

export const supabase = supabaseClient;
