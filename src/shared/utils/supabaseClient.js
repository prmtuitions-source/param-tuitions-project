import { createClient } from '@supabase/supabase-js';

/**
 * PARAM TUITIONS - DATABASE CONNECTION HUB
 * Date: January 27, 2026
 * Branch: Varanasi Main
 */

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY) || '';

// 1. Safety Audit: Verifying Environment Keys
const hasSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey);
if (!hasSupabaseKeys) {
  // Supabase keys are missing. Check your .env file. Avoid creating client during import.
}

// 2. Initialize the Client for the Bureau (only when keys are available)
// If keys are missing in the environment (e.g. local dev without .env),
// provide a safe fallback object so application code that accesses
// `supabase.auth` or `supabase.from()` does not throw `Cannot read properties of null`.
const makeNoopQuery = () => {
  const q = {
    select: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    order: () => q,
    limit: () => q,
    eq: () => q,
    gte: () => q,
    update: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    // allow awaiting the query object directly
    then: (resolve) => resolve({ data: [], error: null }),
  };
  return q;
};

const noopFrom = () => makeNoopQuery();

const noopChannel = () => ({
  on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
  subscribe: () => ({ unsubscribe: () => {} }),
});

const noopAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: (cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signOut: async () => ({ error: null }),
  // No-op implementations: throw so calling code's `catch` runs
  signInWithOAuth: async () => { throw new Error('Supabase not configured (missing VITE_SUPABASE_URL / ANON key)'); },
  signInWithPassword: async () => { throw new Error('Supabase not configured (missing VITE_SUPABASE_URL / ANON key)'); },
  signUp: async () => { throw new Error('Supabase not configured (missing VITE_SUPABASE_URL / ANON key)'); },
};


export const supabase = hasSupabaseKeys ? createClient(supabaseUrl, supabaseAnonKey) : {
  auth: noopAuth,
  from: noopFrom,
  channel: noopChannel,
  // removeChannel used by some components when cleaning up realtime subscriptions
  removeChannel: (subscription) => {
    try {
      if (!subscription) return;
      if (typeof subscription.unsubscribe === 'function') return subscription.unsubscribe();
      if (subscription.topic && typeof subscription.unsubscribe === 'function') return subscription.unsubscribe();
    } catch (e) {
      // swallow in fallback
    }
  },
};

// Expose client to window in development for debugging (console commands)
if (supabase && ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production') || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production' && typeof globalThis !== 'undefined'))) {
  try {
    globalThis.supabase = supabase;
  } catch (e) {
    // ignore
  }
}

/**
 * CONNECTION TESTER
 * Run this in your App.js or Dashboard to confirm the link is active.
 */
export const testConnection = async () => {
  try {
    if (!supabase) {
      // Supabase client not configured; return false rather than throwing.
      return false;
    }

    const { data, error } = await supabase
      .from('locations')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    return true;
  } catch (err) {
    return false;
  }
};