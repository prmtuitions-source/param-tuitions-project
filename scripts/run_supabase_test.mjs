import { config } from 'dotenv';
config();
import { testConnection } from '../src/shared/utils/supabaseClient.js';

(async () => {
  try {
    const ok = await testConnection();
    console.log('testConnection result:', ok);
    process.exit(ok ? 0 : 2);
  } catch (e) {
    console.error('testConnection error:', e && e.message ? e.message : e);
    process.exit(3);
  }
})();
