import React, { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';

export default function ScoreGauge({
  score = 0,
  label = 'Needs Improvement',
  components = null,
  showBreakdown = true
}) {
  const numericScore = Math.min(100, Math.max(0, Math.round(score)));
  const [revealRef, isVisible] = useScrollReveal({ threshold: 0.2 });

  // Animate the main score number
  const countedScore = useCountUp(numericScore, 1300, isVisible);

  // Animate breakdown bars: delayed slightly after main bar
  const [barsActive, setBarsActive] = useState(false);
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setBarsActive(true), 400);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const getBadgeStyle = () => {
    if (numericScore >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (numericScore >= 60) return 'bg-teal-100 text-teal-800 border-teal-300';
    if (numericScore >= 40) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const getProgressColor = () => {
    if (numericScore >= 80) return 'bg-emerald-600';
    if (numericScore >= 60) return 'bg-teal-600';
    if (numericScore >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const breakdownItems = [
    { key: 'segregation_score', label: 'Waste Segregation', weight: '25%', color: 'bg-emerald-500' },
    { key: 'recovery_score',    label: 'Waste Recovery',    weight: '30%', color: 'bg-blue-500' },
    { key: 'recycling_score',   label: 'Recycling & Composting', weight: '20%', color: 'bg-teal-500' },
    { key: 'collection_score',  label: 'Collection Efficiency', weight: '25%', color: 'bg-amber-500' },
  ];

  return (
    <div
      ref={revealRef}
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between card-hover"
    >
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Project-Defined Metric
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Bazar Sustainability Score</h3>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 status-badge ${getBadgeStyle()}`}>
            {label || (numericScore >= 80 ? 'Excellent' : numericScore >= 60 ? 'Good' : numericScore >= 40 ? 'Developing' : 'Needs Improvement')}
          </span>
        </div>

        {/* Animated Score Number */}
        <div className="flex items-baseline space-x-2 my-2">
          <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight tabular-nums">
            {countedScore}
          </span>
          <span className="text-slate-400 font-semibold text-base">/ 100</span>
        </div>

        {/* Main Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 mb-4 overflow-hidden" role="progressbar" aria-valuenow={numericScore} aria-valuemin="0" aria-valuemax="100">
          <div
            className={`h-full rounded-full ${getProgressColor()} transition-all duration-1000 ease-out`}
            style={{ width: isVisible ? `${numericScore}%` : '0%' }}
          />
        </div>
      </div>

      {showBreakdown && (
        <div className="pt-3 border-t border-slate-100 space-y-3.5">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Score Breakdown:
          </p>

          {breakdownItems.map((item, idx) => {
            const val = components?.[item.key] ?? 0;
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} aria-hidden="true" />
                    {item.label}
                    <span className="text-slate-400 text-[10px]">({item.weight})</span>
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {components?.[item.key] !== undefined ? `${val}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{
                      width: barsActive ? `${val}%` : '0%',
                      transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${idx * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-4 italic leading-tight">
        * Project-defined metric for demonstration; not an official environmental certification.
      </p>
    </div>
  );
}
