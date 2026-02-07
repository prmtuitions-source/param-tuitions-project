import { useEffect } from 'react';

export default function useScrollAnimation() {
  useEffect(() => {
    const observerOptions = { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Triggers slightly before the element is fully in view
    };

    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}