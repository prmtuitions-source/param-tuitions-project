import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://<your-project>.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '<your-anon-key>';

if (SUPABASE_URL.includes('<your-project>') || SUPABASE_ANON_KEY === '<your-anon-key>') {
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  const email = process.env.TEST_EMAIL || 'test+1@example.com';
  const password = process.env.TEST_PASSWORD;
  if (!password) {
    console.error('Set TEST_PASSWORD environment variable to run this script. Aborting to avoid hardcoded credentials.');
    process.exit(1);
  }
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log('signUp result:', { data, error });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();
