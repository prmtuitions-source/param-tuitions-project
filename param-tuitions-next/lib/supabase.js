import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vpxeotkakqjutxtxdsek.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweGVvdGtha3FqdXR4dHhkc2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Mjk3NjIsImV4cCI6MjA4NTAwNTc2Mn0.WW8lv8uxJ6zkbS0dsWo9Wo3HZn1mtU87BgkBc8qp9CU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
