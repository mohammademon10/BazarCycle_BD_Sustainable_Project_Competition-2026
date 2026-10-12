import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, DollarSign, Recycle, Leaf } from 'lucide-react';
import api from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/waste/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Classification Engine</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Waste Categories & Pathways</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized waste streams, valuation benchmarks (BDT/KG), and destination resource pathways.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.waste_type}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {c.organic && (
                      <span className="p-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Organic</span>
                    )}
                    {c.recyclable && (
                      <span className="p-1 rounded bg-sky-50 text-sky-700 text-[10px] font-bold">Recyclable</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination Pathway:</span>
                    <strong className="text-emerald-700">{c.resource_pathway}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Benchmark:</span>
                    <strong className="text-amber-800">{c.estimated_value_per_kg} BDT / KG</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                Active in deterministic recommendation engine
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
