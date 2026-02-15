import React, { useState, useEffect } from 'react';
import getSignedUrl from '../utils/getSignedUrl';

export default function SignedImg({ path, bucket = 'teacher-verification', alt = '', className = '', placeholder = 'https://placehold.co/150' }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchUrl() {
      if (!path) { setUrl(null); return; }
      if (path.startsWith('http')) { setUrl(path); return; }
      const s = await getSignedUrl(path, bucket);
      if (mounted) setUrl(s || path);
    }
    fetchUrl();
    return () => { mounted = false; };
  }, [path, bucket]);

  if (!path) return <div className="flex items-center h-full justify-center text-gray-400 text-xs">NO PHOTO</div>;
  return <img src={url || placeholder} alt={alt} className={className} />;
}
