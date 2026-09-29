import { useState, useEffect, useRef } from 'react';

/**
 * useScrollReveal — fires `visible` once when the element enters the viewport.
 * Respects prefers-reduced-motion by returning `true` immediately.
 * @param {object} options - IntersectionObserver options
 */
export default function useScrollReveal(options = { threshold: 0.1 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (reduced) { setVisible(true); return; }
    const node = ref.current;
    if (!node || !window.IntersectionObserver) { setVisible(true); return; }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
