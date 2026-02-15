import { supabase } from '../utils/supabaseClient';

export default async function getSignedUrl(path, bucket = 'teacher-verification', expires = 60) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const resp = await fetch(`/api/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}&expires=${encodeURIComponent(expires)}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!resp.ok) {
      return null;
    }
    const json = await resp.json();
    return json.signedUrl || null;
  } catch (err) {
    // getSignedU
  }
}
