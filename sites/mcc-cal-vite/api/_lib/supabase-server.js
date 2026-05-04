import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client with full database access
export function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[supabase-server] Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}
