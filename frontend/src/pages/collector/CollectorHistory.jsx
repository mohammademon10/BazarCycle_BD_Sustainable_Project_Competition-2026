import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, MapPin, Calendar, Scale } from 'lucide-react';
import api from '../../services/api';

export default function CollectorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/pickups/my?status_filter=COLLECTED');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to load collection history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalKg = history.reduce((sum, p) => sum + p.quantity_kg, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified History</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Collection Log & Audit History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified deliveries to local composting and recycling operations.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
            <span className="text-emerald-800 font-medium">Total Recovered: </span>
            <strong className="text-emerald-950 font-bold">{totalKg.toLocaleString()} KG</strong>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No completed collections on record.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Collected Date</th>
                    <th className="py-2.5 px-3 text-left">Market</th>
                    <th className="py-2.5 px-3 text-left">Category</th>
                    <th className="py-2.5 px-3 text-right">Quantity (KG)</th>
                    <th className="py-2.5 px-3 text-left">Pathway Diverted</th>
                    <th className="py-2.5 px-3 text-right">Est. Value (BDT)</th>
                    <th className="py-2.5 px-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                        {p.collected_at ? new Date(p.collected_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.market_name}</td>
                      <td className="py-2.5 px-3 font-medium">{p.category_name}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {p.quantity_kg.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">{p.recommended_pathway}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                        {p.estimated_value.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">
                        {p.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
