import React from 'react';

/**
 * SkeletonCard — shimmer placeholder for loading states.
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 animate-pulse ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-2/5"></div>
          <div className="h-8 bg-slate-200 rounded w-3/5 mt-3"></div>
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-200 rounded w-3/5"></div>
      </div>
    </div>
  );
}

/**
 * SkeletonRow — shimmer for table rows.
 */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

/**
 * SkeletonText — shimmer for text blocks.
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-200 rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * LoadingSpinner — simple spinner with accessible label.
 */
export function LoadingSpinner({ size = 'md', color = 'emerald', label = 'Loading...' }) {
  const sizeMap = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  const colorMap = { emerald: 'border-emerald-600', sky: 'border-sky-600', amber: 'border-amber-500', white: 'border-white' };
  return (
    <span role="status" aria-label={label}>
      <span
        className={`block rounded-full border-t-transparent animate-spin ${sizeMap[size] || sizeMap.md} ${colorMap[color] || colorMap.emerald}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * EmptyState — friendly zero-data component.
 */
export function EmptyState({ icon: Icon, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
