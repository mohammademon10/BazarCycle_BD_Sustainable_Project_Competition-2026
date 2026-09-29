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
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Project-Defined Metric
          </span>
          <h3 className="text-lg font-bold text-slate-900">Bazar Sustainability Score</h3>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle()}`}>
          {label || (numericScore >= 80 ? 'Excellent' : numericScore >= 60 ? 'Good' : numericScore >= 40 ? 'Developing' : 'Needs Improvement')}
        </span>
      </div>

      <div className="flex items-end space-x-3 mb-3">
        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{numericScore}</span>
        <span className="text-slate-400 font-semibold text-lg pb-1">/ 100</span>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
          style={{ width: `${numericScore}%` }}
        />
      </div>

      {showBreakdown && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-xs text-slate-500 font-medium mb-2">Weighting & Category Breakdown:</p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Waste Segregation (25%)
            </span>
            <span className="font-semibold text-slate-800">
              {components?.segregation_score !== undefined ? `${components.segregation_score}%` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Waste Recovery (30%)
            </span>
            <span className="font-semibold text-slate-800">
              {components?.recovery_score !== undefined ? `${components.recovery_score}%` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
              Recycling & Composting (20%)
            </span>
            <span className="font-semibold text-slate-800">
              {components?.recycling_score !== undefined ? `${components.recycling_score}%` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Collection Efficiency (25%)
            </span>
            <span className="font-semibold text-slate-800">
              {components?.collection_score !== undefined ? `${components.collection_score}%` : '—'}
            </span>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-4 italic">
        * Note: Bazar Sustainability Score is a project-defined metric for demonstration purposes; it is not an official environmental certification.
      </p>
    </div>
  );
}
