// Lightweight vanilla JS parallax initializer
// Usage: import { initParallax } and call with a selector and speed (0..1)
export function initParallax(selector, speed = 0.5) {
  if (typeof document === 'undefined') return () => {};
  const root = document.querySelector(selector);
  if (!root) return () => {};
  const bg = root.querySelector('.hero-bg');
  if (!bg) return () => {};

  let ticking = false;

  function update() {
    // Move background at `speed` fraction of the page scroll to create half-speed effect
    const y = (typeof globalThis !== 'undefined' && (globalThis.scrollY || globalThis.pageYOffset)) || 0;
    const translateY = -Math.round(y * speed);
    // apply a subtle transform (use translate3d for GPU accel)
    bg.style.transform = `translate3d(0, ${translateY}px, 0)`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      (typeof globalThis !== 'undefined' ? globalThis.requestAnimationFrame(update) : setTimeout(update, 16));
      ticking = true;
    }
  }

  // Initialize and bind
  update();
  (typeof globalThis !== 'undefined' ? globalThis.addEventListener('scroll', onScroll, { passive: true }) : null);

  // Return cleanup
  return () => { if (typeof globalThis !== 'undefined') globalThis.removeEventListener('scroll', onScroll); };
}
