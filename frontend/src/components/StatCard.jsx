import React from 'react';

export default function StatCard({
  title,
  value,
  unit = '',
  subtitle = null,
  icon: Icon,
  badge = null,
  colorScheme = 'emerald' // 'emerald' | 'amber' | 'blue' | 'purple' | 'slate'
}) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500 text-white'
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-100',
      iconBg: 'bg-sky-600 text-white'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white'
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      iconBg: 'bg-slate-700 text-white'
    }
  };

  const style = colorStyles[colorScheme] || colorStyles.emerald;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-baseline space-x-1.5 mt-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {value}
            </span>
            {unit && <span className="text-xs sm:text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          {subtitle && <span className="text-slate-500 text-[11px] truncate">{subtitle}</span>}
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${style.bg} ${style.text}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
