import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, Scale } from 'lucide-react';
import api from '../../services/api';

export default function AdminWaste() {
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWaste = async () => {
      try {
        const res = await api.get('/waste');
        setWaste(res.data);
      } catch (err) {
        console.error('Failed to load waste records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWaste();
  }, []);

  const filtered = waste.filter(w => 
    !search || 
    w.market_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Audit Trail</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Platform-Wide Waste Records</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified registry of all batches logged across all onboarded markets.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by market or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Market</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-left">Pathway</th>
                    <th className="py-3 px-4 text-right">Est. Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">{item.record_date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.market_name}</td>
                      <td className="py-3 px-4 font-medium">{item.category_name}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {item.quantity_kg.toLocaleString()} KG
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{item.recommended_pathway}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {item.estimated_value.toLocaleString()} BDT
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          item.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-sky-100 text-sky-800 border-sky-300'
                        }`}>
                          {item.status}
                        </span>
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
