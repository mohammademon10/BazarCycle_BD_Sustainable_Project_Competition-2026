import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — animates a number from 0 to `end`.
 * Respects prefers-reduced-motion.
 * @param {number} end - Target value
 * @param {number} duration - Animation duration in ms (default 1200)
 * @param {boolean} start - Start trigger
 */
export default function useCountUp(end = 0, duration = 1200, start = true) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(null);
  const reduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setCurrent(end);
      return;
    }

    const numericEnd = parseFloat(String(end).replace(/,/g, '')) || 0;
    if (numericEnd === 0) { setCurrent(0); return; }

    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * numericEnd));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(numericEnd);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, start, reduced]);

  return current;
}
