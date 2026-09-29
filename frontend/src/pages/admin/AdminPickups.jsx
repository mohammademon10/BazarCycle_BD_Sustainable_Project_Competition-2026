import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import api from '../../services/api';

export default function AdminPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await api.get('/pickups');
        setPickups(res.data);
      } catch (err) {
        console.error('Failed to load pickups', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, []);

  const filtered = pickups.filter(p => !statusFilter || p.status === statusFilter);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Logistics Audit</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Platform Pickup Operations</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of pickup requests, assignments, and verified collection times.
            </p>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl py-2 px-3 bg-white font-medium"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="COLLECTED">COLLECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading pickups...</div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 font-medium sm:hidden block mb-2">
                Scroll horizontally on mobile &rarr;
              </span>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Requested</th>
                    <th className="py-3 px-4 text-left">Market</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-left">Collector</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {p.requested_at ? new Date(p.requested_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.market_name}</td>
                      <td className="py-3.5 px-4 font-medium">{p.category_name}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {p.quantity_kg.toLocaleString()} KG
                      </td>
                      <td className="py-3.5 px-4">
                        {p.collector_name ? (
                          <span className="font-semibold text-sky-800">{p.collector_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          p.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          p.status === 'AVAILABLE' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>

      </div>
    </div>
  );
}
