import React from 'react';

export default function ScoreGauge({
  score = 0,
  label = 'Needs Improvement',
  components = null,
  showBreakdown = true
}) {
  const numericScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color scheme based on score
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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Project-Defined Metric
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Bazar Sustainability Score</h3>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${getBadgeStyle()}`}>
            {label || (numericScore >= 80 ? 'Excellent' : numericScore >= 60 ? 'Good' : numericScore >= 40 ? 'Developing' : 'Needs Improvement')}
          </span>
        </div>

        <div className="flex items-baseline space-x-2 my-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{numericScore}</span>
          <span className="text-slate-400 font-semibold text-base">/ 100</span>
        </div>

        {/* Main Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
            style={{ width: `${numericScore}%` }}
          />
        </div>
      </div>

      {showBreakdown && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Weighting & Category Breakdown:
          </p>
          
          {/* Segregation (25%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
                Waste Segregation (25%)
              </span>
              <span className="font-bold text-slate-900">
                {components?.segregation_score !== undefined ? `${components.segregation_score}%` : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${components?.segregation_score || 0}%` }}
              />
            </div>
          </div>

          {/* Recovery (30%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
                Waste Recovery (30%)
              </span>
              <span className="font-bold text-slate-900">
                {components?.recovery_score !== undefined ? `${components.recovery_score}%` : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${components?.recovery_score || 0}%` }}
              />
            </div>
          </div>

          {/* Recycling & Composting (20%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 shrink-0"></span>
                Recycling & Composting (20%)
              </span>
              <span className="font-bold text-slate-900">
                {components?.recycling_score !== undefined ? `${components.recycling_score}%` : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${components?.recycling_score || 0}%` }}
              />
            </div>
          </div>

          {/* Collection Efficiency (25%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0"></span>
                Collection Efficiency (25%)
              </span>
              <span className="font-bold text-slate-900">
                {components?.collection_score !== undefined ? `${components.collection_score}%` : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${components?.collection_score || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-4 italic leading-tight">
        * Project-defined metric for demonstration; not an official environmental certification.
      </p>
    </div>
  );
}
