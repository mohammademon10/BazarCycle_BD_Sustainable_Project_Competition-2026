import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Leaf, 
  Recycle, 
  TrendingUp, 
  DollarSign, 
  Award, 
  ShieldAlert, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import ScoreGauge from '../../components/ScoreGauge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export default function ImpactPage() {
  const [summary, setSummary] = useState(null);
  const [marketScores, setMarketScores] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const [sumRes, scoresRes, statsRes] = await Promise.all([
          api.get('/impact/summary'),
          api.get('/sustainability/markets'),
          // Fetch public dashboard chart stats
          api.get('/impact/summary') // we can construct clean chart data from live metrics
        ]);
        setSummary(sumRes.data);
        setMarketScores(scoresRes.data || []);
      } catch (err) {
        console.error('Failed to load impact stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpactData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading verified impact data...</p>
        </div>
      </div>
    );
  }

  // Chart 1: Recovery Distribution
  const recoveryChartData = {
    labels: ['Organic Composting', 'Plastic & Paper Recycling', 'Pending Collection'],
    datasets: [
      {
        data: [
          summary?.total_waste_composted_kg || 0,
          summary?.total_waste_recycled_kg || 0,
          Math.max(0, (summary?.total_waste_registered_kg || 0) - (summary?.total_waste_recovered_kg || 0))
        ],
        backgroundColor: ['#16a34a', '#0284c7', '#cbd5e1'],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  // Chart 2: Waste Diverted vs Total
  const diversionChartData = {
    labels: ['Total Registered', 'Total Recovered', 'Composted', 'Recycled'],
    datasets: [
      {
        label: 'Weight (KG)',
        data: [
          summary?.total_waste_registered_kg || 0,
          summary?.total_waste_recovered_kg || 0,
          summary?.total_waste_composted_kg || 0,
          summary?.total_waste_recycled_kg || 0
        ],
        backgroundColor: ['#64748b', '#16a34a', '#22c55e', '#0284c7'],
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Transparency Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Environmental & Resource Impact
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Live measurements across all registered Dhaka markets. Figures reflect completed collections logged directly in the database.
          </p>
        </div>

        {/* Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Registered Waste"
            value={summary ? summary.total_waste_registered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Batches logged by market managers"
            icon={Layers}
            colorScheme="slate"
          />

          <StatCard
            title="Total Recovered Waste"
            value={summary ? summary.total_waste_recovered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Verified collected & diverted"
            icon={Recycle}
            colorScheme="emerald"
            badge={`${summary?.pickup_completion_rate || 0}% Completion`}
          />

          <StatCard
            title="Estimated Resource Value"
            value={summary ? summary.total_estimated_value_bdt.toLocaleString() : '0'}
            unit="BDT"
            subtitle="Project Estimate for demonstration"
            icon={DollarSign}
            colorScheme="amber"
          />

          <StatCard
            title="CO₂ Avoided Estimate"
            value={summary ? summary.total_co2_impact_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Project Estimate (Landfill diversion)"
            icon={Leaf}
            colorScheme="blue"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Donut Breakdown */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Breakdown</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Resource Recovery Pathways</h3>
              <p className="text-xs text-slate-500 mb-4">Volume diverted by transformation type</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={recoveryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                  }
                }}
              />
            </div>
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Total Composted: <strong>{summary?.total_waste_composted_kg || 0} KG</strong></span>
              <span>Total Recycled: <strong>{summary?.total_waste_recycled_kg || 0} KG</strong></span>
            </div>
          </div>

          {/* Chart 2: Bar Comparison */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tonnage Comparison</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Registered vs Recovered Stream</h3>
              <p className="text-xs text-slate-500 mb-4">Live comparison across total volume</p>
            </div>
            <div className="h-64">
              <Bar
                data={diversionChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }
                }}
              />
            </div>
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              * Waste Recovery Rate: <strong>{summary && summary.total_waste_registered_kg > 0 ? ((summary.total_waste_recovered_kg / summary.total_waste_registered_kg) * 100).toFixed(1) : 0}%</strong> of registered waste successfully connected to recycling/composting collectors.
            </div>
          </div>
        </div>

        {/* Market Sustainability Scores Leaderboard */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Project Metric</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Bazar Sustainability Score Leaderboard</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated dynamically from Segregation (25%), Recovery (30%), Recycling (20%), and Collection Efficiency (25%).
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                Active Markets: {summary?.active_markets_count || marketScores.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase">Market Name</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Segregation (25%)</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Recovery (30%)</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Recycling (20%)</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Collection (25%)</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Total Score</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-700 uppercase">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {marketScores.map((score, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{score.market_name || `Market ${score.market_id.slice(0, 6)}`}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium">{score.segregation_score}%</td>
                    <td className="px-4 py-3.5 text-center font-medium">{score.recovery_score}%</td>
                    <td className="px-4 py-3.5 text-center font-medium">{score.recycling_score}%</td>
                    <td className="px-4 py-3.5 text-center font-medium">{score.collection_score}%</td>
                    <td className="px-4 py-3.5 text-center font-extrabold text-base text-emerald-700">
                      {score.total_score} <span className="text-xs font-normal text-slate-400">/100</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        score.total_score >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        score.total_score >= 60 ? 'bg-teal-100 text-teal-800 border-teal-200' :
                        score.total_score >= 40 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {score.score_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory & Scientific Disclaimers Notice */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Important Estimation Disclaimers:</span>
          </p>
          <p>
            1. <strong>CO₂ Impact:</strong> Clearly designated as a <em>Project Estimate</em> based on avoided methane and open disposal factors.
          </p>
          <p>
            2. <strong>Estimated Resource Value:</strong> Values in BDT are project estimates for competition demonstration purposes and may vary by location, quality, and market conditions.
          </p>
        </div>

      </div>
    </div>
  );
}
