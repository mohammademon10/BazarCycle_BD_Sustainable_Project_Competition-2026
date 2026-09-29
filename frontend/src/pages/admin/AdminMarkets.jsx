import React, { useState, useEffect } from 'react';
import { Store, PlusCircle, MapPin, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminMarkets() {
  const [markets, setMarkets] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Market Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [managerId, setManagerId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarketsAndManagers = async () => {
    try {
      const [mRes, uRes] = await Promise.all([
        api.get('/markets'),
        api.get('/auth/users?role=MARKET_MANAGER')
      ]);
      setMarkets(mRes.data);
      setManagers(uRes.data);
    } catch (err) {
      console.error('Failed to load markets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketsAndManagers();
  }, []);

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/markets', {
        name,
        location,
        area,
        manager_id: managerId || null,
        contact_phone: contactPhone || null,
        status: 'ACTIVE'
      });
      setShowModal(false);
      setName('');
      setLocation('');
      setArea('');
      setManagerId('');
      setContactPhone('');
      await fetchMarketsAndManagers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create market.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Market Infrastructure</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Registered Local Markets</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Wholesale and neighborhood bazars onboarded to the BazarCycle BD tracking network.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Onboard New Market</span>
          </button>
        </div>

        {/* Modal: Create Market */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-lg text-slate-900">Onboard Local Bazar / Market</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">{error}</div>
              )}

              <form onSubmit={handleCreateMarket} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Market Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kawran Bazar Wholesale Market"
                    className="mt-1 block w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Location Address *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tejgaon, Dhaka 1215"
                    className="mt-1 block w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">District / Area *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Central Dhaka"
                    className="mt-1 block w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Assigned Market Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="mt-1 block w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="">Select Manager (or assign later)</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+88017..."
                    className="mt-1 block w-full p-2 border rounded-lg"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    {submitting ? 'Saving...' : 'Register Market'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Markets Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {m.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">{m.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {m.location}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Area: {m.area}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Manager:</span>
                  <strong className="text-slate-800">{m.manager_name || 'Unassigned'}</strong>
                </div>
                {m.contact_phone && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Phone:</span>
                    <span>{m.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
