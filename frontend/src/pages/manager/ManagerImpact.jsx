import React, { useState, useEffect } from 'react';
import { Leaf, Recycle, DollarSign, BarChart3, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

export default function ManagerImpact() {
  const [impactRecords, setImpactRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.get('/impact/records');
        setImpactRecords(res.data);
      } catch (err) {
        console.error('Failed to load impact records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  const totalRecovered = impactRecords.reduce((sum, r) => sum + r.quantity_recovered_kg, 0);
  const totalComposted = impactRecords.reduce((sum, r) => sum + r.quantity_composted_kg, 0);
  const totalRecycled = impactRecords.reduce((sum, r) => sum + r.quantity_recycled_kg, 0);
  const totalValue = impactRecords.reduce((sum, r) => sum + r.estimated_value, 0);
  const totalCo2 = impactRecords.reduce((sum, r) => sum + r.co2_impact_estimate, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Market Performance</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Environmental Impact Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready log of recovered waste batches diverted from landfills into verified composting and recycling.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Diverted"
            value={totalRecovered.toLocaleString()}
            unit="KG"
            subtitle="100% verified collected"
            icon={Recycle}
            colorScheme="emerald"
          />

          <StatCard
            title="Organic Composted"
            value={totalComposted.toLocaleString()}
            unit="KG"
            subtitle="Redirected to bio-fertilizer"
            icon={Leaf}
            colorScheme="slate"
          />

          <StatCard
            title="Materials Recycled"
            value={totalRecycled.toLocaleString()}
            unit="KG"
            subtitle="Plastic & paper reprocessed"
            icon={Award}
            colorScheme="blue"
          />

          <StatCard
            title="Avoided CO₂e"
            value={totalCo2.toLocaleString()}
            unit="KG"
            subtitle="Project Estimate (Landfill factor)"
            icon={Leaf}
            colorScheme="amber"
          />
        </div>

        {/* Impact Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Verified Impact Batches</h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading verified impact...</div>
          ) : impactRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No impact records generated yet. Complete collections to generate impact.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Recorded At</th>
                    <th className="py-2.5 px-3 text-left">Category</th>
                    <th className="py-2.5 px-3 text-right">Recovered (KG)</th>
                    <th className="py-2.5 px-3 text-right">Composted (KG)</th>
                    <th className="py-2.5 px-3 text-right">Recycled (KG)</th>
                    <th className="py-2.5 px-3 text-right">Est. Value (BDT)</th>
                    <th className="py-2.5 px-3 text-right">CO₂ Avoided</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {impactRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                        {new Date(r.recorded_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.category_name}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-800">
                        {r.quantity_recovered_kg} KG
                      </td>
                      <td className="py-2.5 px-3 text-right">{r.quantity_composted_kg} KG</td>
                      <td className="py-2.5 px-3 text-right">{r.quantity_recycled_kg} KG</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-800">
                        {r.estimated_value.toLocaleString()} BDT
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                        {r.co2_impact_estimate} KG
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <p>
            * All CO₂ calculations are <strong>Project Estimates</strong> calculated from standard landfill avoidance factors. All monetary resource values are project estimates for competition demonstration purposes.
          </p>
        </div>

      </div>
    </div>
  );
}
