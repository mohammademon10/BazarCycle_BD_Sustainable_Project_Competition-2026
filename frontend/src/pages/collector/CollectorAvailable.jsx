import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Package, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SkeletonCard } from '../../components/ui';
import { EmptyState } from '../../components/ui';

// Status timeline component
function StatusTimeline({ status }) {
  const steps = [
    { key: 'AVAILABLE', label: 'Posted', icon: '📋' },
    { key: 'ACCEPTED',  label: 'Accepted', icon: '🤝' },
    { key: 'COLLECTED', label: 'Collected', icon: '✅' },
  ];
  const idx = steps.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i <= idx
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
              aria-current={i === idx ? 'step' : undefined}
            >
              {step.icon}
            </div>
            <span className={`text-[9px] mt-0.5 font-semibold ${i <= idx ? 'text-sky-700' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-4 mx-0.5 transition-all duration-500 ${i < idx ? 'bg-sky-500' : 'bg-slate-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CollectorAvailable() {
  const [availablePickups, setAvailablePickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const fetchAvailable = async () => {
    try {
      const res = await api.get('/pickups/available');
      setAvailablePickups(res.data);
    } catch (err) {
      console.error('Failed to load available pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAccept = async (pickupId) => {
    setError(null);
    setSuccess(null);
    setAcceptingId(pickupId);

    try {
      await api.post(`/pickups/${pickupId}/accept`);
      setSuccess('Pickup request accepted! Status is now ACCEPTED.');
      setTimeout(() => {
        navigate('/collector/pickups');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to accept pickup. It may have been accepted by another collector.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      fetchAvailable();
    } finally {
      setAcceptingId(null);
    }
  };

  // Category emoji helper
  const catEmoji = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('veg')) return '🥬';
    if (n.includes('fruit')) return '🍎';
    if (n.includes('fish')) return '🐟';
    if (n.includes('plastic')) return '♻️';
    if (n.includes('paper') || n.includes('card')) return '📦';
    return '🗑️';
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Step 6 & 7 of Core Demo</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Available Pickups Feed</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pending market waste batches waiting for collector acceptance.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>{availablePickups.length} Batches Available</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs animate-slide-up" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-emerald-800 text-xs animate-slide-up" role="status">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}

        {/* Available Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : availablePickups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState
              icon={Truck}
              title="No available pickups right now"
              description="When a Market Manager logs waste and requests a pickup, it will immediately appear here. Check back soon!"
              action={
                <button
                  onClick={fetchAvailable}
                  className="btn-secondary px-4 py-2 text-xs font-semibold rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                >
                  Refresh Feed
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePickups.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm card-hover hover:border-sky-300 flex flex-col justify-between space-y-4 reveal-visible"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
                      <span aria-hidden="true">{catEmoji(p.category_name)}</span>
                      {p.category_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {p.requested_at ? new Date(p.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{p.market_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" aria-hidden="true" />
                      {p.market_location || p.market_area}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Quantity</span>
                      <p className="font-extrabold text-base text-slate-900 tabular-nums">{p.quantity_kg} KG</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Est. Value</span>
                      <p className="font-bold text-base text-amber-700 tabular-nums">{p.estimated_value} BDT</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span><span className="font-semibold text-slate-700">Pathway: </span>
                    <span className="text-emerald-700 font-bold">{p.recommended_pathway}</span></span>
                  </div>

                  {/* Status Timeline */}
                  <StatusTimeline status="AVAILABLE" />

                  {p.notes && (
                    <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100 italic">
                      📍 {p.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleAccept(p.id)}
                    disabled={acceptingId === p.id}
                    className="btn-primary w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Truck className="w-4 h-4" aria-hidden="true" />
                    <span>{acceptingId === p.id ? 'Accepting...' : 'Accept Pickup Request'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
