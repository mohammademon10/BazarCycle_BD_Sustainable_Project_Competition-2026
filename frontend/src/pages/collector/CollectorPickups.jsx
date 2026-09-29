import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CollectorPickups() {
  const [activePickups, setActivePickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [pickupNotes, setPickupNotes] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchActive = async () => {
    try {
      const res = await api.get('/pickups/my?status_filter=ACCEPTED');
      setActivePickups(res.data);
    } catch (err) {
      console.error('Failed to load active pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  const handleMarkCollected = async (pickupId) => {
    setCompletingId(pickupId);
    setError(null);
    setSuccessMsg(null);

    const noteText = pickupNotes[pickupId]?.trim() || 'Batch loaded in collector vehicle and weighed.';

    try {
      await api.post(`/pickups/${pickupId}/collect`, {
        notes: noteText
      });
      setSuccessMsg('Batch collected! Impact Record and CO₂ savings generated automatically.');
      await fetchActive();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to complete collection.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Step 8 of Core Demo</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Active Pickups In Transit</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Batches you have accepted. Mark as collected once loaded from market sheds.
            </p>
          </div>

          <Link
            to="/collector/available"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center space-x-1"
          >
            <span>Browse More Pickups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <Link
              to="/impact"
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition"
            >
              View Public Impact
            </Link>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading active jobs...</div>
        ) : activePickups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-sm font-semibold text-slate-800">No active pickups pending collection.</p>
            <p className="text-xs text-slate-400">All accepted batches have been collected and verified!</p>
            <Link
              to="/collector/available"
              className="inline-block px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 transition"
            >
              View Available Pickups
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePickups.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      ACCEPTED • IN TRANSIT
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {p.accepted_at ? new Date(p.accepted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{p.market_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {p.market_location || p.market_area}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Category</span>
                      <p className="font-bold text-slate-900">{p.category_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Tonnage</span>
                      <p className="font-extrabold text-slate-900">{p.quantity_kg} KG</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Target Pathway: </span>
                    <span className="text-emerald-700 font-bold">{p.recommended_pathway}</span>
                  </div>

                  <div className="pt-2">
                    <label htmlFor={`pickup-note-${p.id}`} className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Collection & Scale Notes (Optional):
                    </label>
                    <input
                      id={`pickup-note-${p.id}`}
                      type="text"
                      placeholder="e.g., Weighed 150kg at Gate 1, driver Kalam"
                      value={pickupNotes[p.id] || ''}
                      onChange={(e) => setPickupNotes({ ...pickupNotes, [p.id]: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleMarkCollected(p.id)}
                    disabled={completingId === p.id}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completingId === p.id ? 'Verifying Collection...' : 'Mark as Collected'}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Triggers automatic ImpactRecord generation
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
