'use client';

import { useEffect } from 'react';

export default function ElfsightReviews() {
  useEffect(() => {
    if (document.querySelector('script[src^="https://elfsightcdn.com"]')) return;
    const s = document.createElement('script');
    s.src = 'https://elfsightcdn.com/platform.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="elfsight-app-6c13c603-c75a-4cec-8618-1a9066db77d1" data-elfsight-app-lazy />
  );
}
