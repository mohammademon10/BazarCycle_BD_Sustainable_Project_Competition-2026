import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [sumRes, scoresRes] = await Promise.all([
          api.get('/impact/summary'),
          api.get('/sustainability/markets')
        ]);
        setSummary(sumRes.data);
        setScores(scoresRes.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Governance & Audit</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Sustainability & Impact Report</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive report on diverted tonnage, resource valuations, and market sustainability scores.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* Report Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 print:p-0 print:border-none print:shadow-none">
          {/* Executive Summary */}
          <div className="border-b pb-6 space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Executive Sustainability Audit</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This report consolidates verified physical collections across registered wholesale and retail agricultural markets in Dhaka, Bangladesh. All recovery metrics reflect completed pickups verified by participating collectors.
            </p>
          </div>

          {/* Key Metric Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Registered</span>
              <p className="text-xl font-black text-slate-900 mt-1">{summary?.total_waste_registered_kg} KG</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Total Diverted</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{summary?.total_waste_recovered_kg} KG</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-700">Est. Resource Value</span>
              <p className="text-xl font-black text-amber-900 mt-1">{summary?.total_estimated_value_bdt} BDT</p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[10px] font-bold uppercase text-sky-700">CO₂ Avoided</span>
              <p className="text-xl font-black text-sky-900 mt-1">{summary?.total_co2_impact_kg} KG</p>
            </div>
          </div>

          {/* Market Performance Scores */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Market-by-Market Bazar Sustainability Scores
            </h3>
            <div>
              <span className="text-[10px] text-slate-400 font-medium sm:hidden block mb-2">
                Scroll horizontally on mobile &rarr;
              </span>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-2 px-3 text-left">Market</th>
                    <th className="py-2 px-3 text-center">Segregation (25%)</th>
                    <th className="py-2 px-3 text-center">Recovery (30%)</th>
                    <th className="py-2 px-3 text-center">Recycling (20%)</th>
                    <th className="py-2 px-3 text-center">Efficiency (25%)</th>
                    <th className="py-2 px-3 text-center">Total Score</th>
                    <th className="py-2 px-3 text-right">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scores.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.market_name}</td>
                      <td className="py-2.5 px-3 text-center">{s.segregation_score}%</td>
                      <td className="py-2.5 px-3 text-center">{s.recovery_score}%</td>
                      <td className="py-2.5 px-3 text-center">{s.recycling_score}%</td>
                      <td className="py-2.5 px-3 text-center">{s.collection_score}%</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{s.total_score}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{s.score_label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* Verification Signoff */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-xs text-slate-500">
            <div>
              <p>Generated by: <strong>BazarCycle BD Platform Engine</strong></p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className="font-semibold text-slate-700">BazarCycle BD Sustainability Initiative</p>
              <p>Don't Dump It. Cycle It.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
