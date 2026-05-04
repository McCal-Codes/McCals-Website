import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Client-side Supabase client (anon key, limited permissions via RLS)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy-initialized Supabase client to prevent errors when env vars not set
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// Export a proxy that lazily initializes the client on first access
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op function for method calls when not configured
      if (prop === 'from' || prop === 'channel' || prop === 'removeChannel') {
        return () => ({
          // Chainable no-op methods
          select: () => ({ data: null, error: new Error('Supabase not configured') }),
          insert: () => ({ data: null, error: new Error('Supabase not configured') }),
          update: () => ({ data: null, error: new Error('Supabase not configured') }),
          delete: () => ({ data: null, error: new Error('Supabase not configured') }),
          eq: () => ({ data: null, error: new Error('Supabase not configured') }),
          order: () => ({ data: null, error: new Error('Supabase not configured') }),
          limit: () => ({ data: null, error: new Error('Supabase not configured') }),
          single: () => ({ data: null, error: new Error('Supabase not configured') }),
          subscribe: () => ({ unsubscribe: () => {} }),
          on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        });
      }
      return undefined;
    }
    return Reflect.get(client, prop);
  },
});

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Realtime subscription helper for availability changes
export function subscribeToAvailability(
  callback: (payload: { new: any; old: any; eventType: string }) => void
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, realtime subscriptions disabled - supabase.ts:55');
    return null;
  }

  return supabase
    .channel('availability_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'availability_slots',
      },
      (payload) => {
        callback({
          new: payload.new,
          old: payload.old,
          eventType: payload.eventType,
        });
      }
    )
    .subscribe();
}

// Unsubscribe helper
export function unsubscribeFromAvailability(channel: any) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}
