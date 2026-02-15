// Lightweight animations (vanilla JS)
// - hero entrance
// - micro hover/float for hero cards
// - section reveal via IntersectionObserver

export function initPageAnimations(options = {}) {
  const root = document;

  // Hero entrance: add class to animate in hero elements
  const hero = root.querySelector('.parallax-hero') || root.querySelector('.hero');
  if (hero) {
    // delay slightly so layout stabilizes
    setTimeout(() => hero.classList.add('hero-animate-in'), 120);
  }

  // Hero card subtle float on hover
  const cards = root.querySelectorAll('.hero-step-card');
  cards.forEach(card => {
    card.addEventListener('pointerenter', () => card.classList.add('card-hover'));
    card.addEventListener('pointerleave', () => card.classList.remove('card-hover'));
  });

  // Section reveal using IntersectionObserver
  const reveals = root.querySelectorAll('.reveal');
  if (reveals.length > 0 && typeof globalThis !== 'undefined' && 'IntersectionObserver' in globalThis) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          // optionally unobserve to avoid repeated triggers
          io.unobserve(en.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    reveals.forEach(r => io.observe(r));
  } else {
    // fallback: immediately mark as visible
    reveals.forEach(r => r.classList.add('in-view'));
  }

  // Return cleanup
  return () => {
    cards.forEach(card => {
      card.removeEventListener('pointerenter', () => {});
      card.removeEventListener('pointerleave', () => {});
    });
  };
}
