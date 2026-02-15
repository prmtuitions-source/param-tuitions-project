// c:\Users\GAURAV PRINCE\Documents\Param-Tuitions-Project\src\components\ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof globalThis !== 'undefined' && typeof globalThis.scrollTo === 'function') {
      globalThis.scrollTo(0, 0);
    } else if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}
