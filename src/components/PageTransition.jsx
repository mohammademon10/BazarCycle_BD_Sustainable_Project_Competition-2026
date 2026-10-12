import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — wraps each routed page with a fade-up entrance.
 * Uses CSS classes from index.css.
 * Respects prefers-reduced-motion via CSS media query in the stylesheet.
 */
export default function PageTransition({ children }) {
  const { key } = useLocation();
  return (
    <div key={key} className="page-enter">
      {children}
    </div>
  );
}
