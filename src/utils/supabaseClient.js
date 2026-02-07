import { createClient } from '@supabase/supabase-js';

/**
 * PARAM TUITIONS - DATABASE CONNECTION HUB
 * Date: January 27, 2026
 * Branch: Varanasi Main
 */

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
console.log("Supabase URL:", supabaseUrl); // Should show your URL, not 'undefined'

// 1. Safety Audit: Verifying Environment Keys
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "CRITICAL: Supabase keys are missing. " +
    "Check your .env file for REACT_APP_ prefix and restart your server (Ctrl+C then npm start)."
  );
}

// 2. Initialize the Client for the Bureau
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * CONNECTION TESTER
 * Run this in your App.js or Dashboard to confirm the link is active.
 */
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('count', { count: 'exact', head: true });
      
    if (error) throw error;
    
    console.log("⚡ [Param Tuitions] Database Connection: SUCCESS. Varanasi nodes linked.");
    return true;
  } catch (err) {
    console.warn("⚠️ [Param Tuitions] Database Connection: FAILED.", err.message);
    return false;
  }
};