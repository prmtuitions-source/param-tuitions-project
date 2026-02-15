export function isSafeHttpUrl(input) {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  try {
    // Allow relative URLs by using window.location.origin as base when available
    const base = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost';
    const u = new URL(trimmed, base);
    const protocol = u.protocol.toLowerCase();
    // Only allow http(s) protocols
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    // Basic sanity: hostname should be present for absolute URLs
    if (!u.hostname) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export default isSafeHttpUrl;
