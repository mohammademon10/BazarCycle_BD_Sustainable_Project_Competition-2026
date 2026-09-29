import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle2, AlertCircle, XCircle, Search } from 'lucide-react';
import api from '../../services/api';

export default function ManagerPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback] = useState(null);

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

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleCancel = async (pickupId) => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return;
    setFeedback(null);
    try {
      await api.post(`/pickups/${pickupId}/cancel`);
      setFeedback({ type: 'success', text: 'Pickup request cancelled successfully.' });
      await fetchPickups();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel pickup';
      setFeedback({ type: 'error', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    }
  };

  const filtered = pickups.filter((p) => !statusFilter || p.status === statusFilter);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Logistics Tracking</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Pickup Requests Status</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of batches awaiting, accepted by, or collected by registered collectors.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl py-2 px-3 bg-white font-medium focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE (Awaiting Collector)</option>
              <option value="ACCEPTED">ACCEPTED (Collector Assigned)</option>
              <option value="COLLECTED">COLLECTED (Recovered)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
        )}

        {/* Pickups Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading pickups...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No pickup requests found.</div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 font-medium sm:hidden block mb-2">
                Scroll horizontally on mobile &rarr;
              </span>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Requested</th>
                    <th className="px-4 py-3 text-left">Market</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-left">Assigned Collector</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                        {p.requested_at ? new Date(p.requested_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{p.market_name}</td>
                      <td className="px-4 py-3.5 font-medium">{p.category_name}</td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                        {p.quantity_kg.toLocaleString()} KG
                      </td>
                      <td className="px-4 py-3.5">
                        {p.collector_name ? (
                          <span className="font-semibold text-sky-800 flex items-center">
                            <Truck className="w-3.5 h-3.5 mr-1 text-sky-600" />
                            {p.collector_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          p.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          p.status === 'AVAILABLE' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {p.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleCancel(p.id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
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
