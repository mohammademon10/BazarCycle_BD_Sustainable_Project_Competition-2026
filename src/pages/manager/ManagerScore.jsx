import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import api from '../../services/api';
import ScoreGauge from '../../components/ScoreGauge';

export default function ManagerScore() {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const marketRes = await api.get('/markets/my/market');
        if (marketRes.data?.id) {
          const res = await api.get(`/sustainability/market/${marketRes.data.id}`);
          setScoreData(res.data);
        }
      } catch (err) {
        console.error('Failed to load sustainability score', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Calculating live score...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Audit & Evaluation</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Bazar Sustainability Score</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of your market's performance across 4 project-defined metrics.
          </p>
        </div>

        {/* Primary Gauge */}
        <ScoreGauge
          score={scoreData?.total_score || 0}
          label={scoreData?.score_label || 'Needs Improvement'}
          components={scoreData}
          showBreakdown={true}
        />

        {/* Metric Explanations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Score Component Breakdown</h3>
          
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-emerald-700">1. Waste Segregation (25% Weight)</span>
                <span>{scoreData?.segregation_score || 0}%</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Measures the percentage of waste registered under clean, segregated categories (vegetables, fruit, fish, plastic, cardboard) rather than mixed unsorted waste ("Other").
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-blue-700">2. Waste Recovery (30% Weight)</span>
                <span>{scoreData?.recovery_score || 0}%</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Measures the actual physical tonnage of waste successfully picked up and recovered relative to all registered waste generated in the market.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-teal-700">3. Recycling & Composting (20% Weight)</span>
                <span>{scoreData?.recycling_score || 0}%</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Rewards diverting waste specifically into circular resource pathways (bio-composting and plastic/cardboard recycling) rather than standard mixed disposal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-amber-700">4. Collection Efficiency (25% Weight)</span>
                <span>{scoreData?.collection_score || 0}%</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Measures fulfillment rate: the percentage of requested pickups that are successfully accepted and collected by logistics partners.
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Tips */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 space-y-3">
          <h4 className="font-bold text-sm text-emerald-900 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>How to Improve Your Market Score</span>
          </h4>
          <ul className="text-xs text-emerald-950 space-y-2 list-disc pl-5">
            <li>Encourage wholesale shed vendors to keep vegetable trimmings separate from plastic twine and wraps.</li>
            <li>Request pickups as soon as morning produce unloading completes so collectors can plan their routes.</li>
            <li>Maintain clear staging areas at designated market gates for rapid van loading.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
