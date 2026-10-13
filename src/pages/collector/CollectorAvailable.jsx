import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Leaf, 
  Search, 
  Filter, 
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SkeletonCard, EmptyState } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

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
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'quantity_desc' | 'value_desc'

  const navigate = useNavigate();
  const toast = useToast();

  const fetchAvailable = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pickups/available');
      setAvailablePickups(res.data || []);
    } catch (err) {
      console.error('Failed to load available pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAccept = async (pickupId, marketName) => {
    setError(null);
    setSuccess(null);
    setAcceptingId(pickupId);

    try {
      await api.post(`/pickups/${pickupId}/accept`);
      const successMsg = `Pickup request for ${marketName || 'batch'} accepted successfully!`;
      setSuccess(successMsg);
      toast.success(successMsg);
      setTimeout(() => {
        navigate('/collector/pickups');
      }, 900);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to accept pickup. It may have been claimed by another collector.';
      const cleanMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
      setError(cleanMsg);
      toast.error(cleanMsg);
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

  // Extract unique categories and locations
  const categories = ['ALL', ...new Set(availablePickups.map(p => p.category_name).filter(Boolean))];
  const locations = ['ALL', ...new Set(availablePickups.map(p => p.market_name || p.market_location).filter(Boolean))];

  // Filtered & Sorted items
  const filteredPickups = availablePickups
    .filter(p => {
      const matchesSearch = 
        (p.market_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category_name === selectedCategory;
      const matchesLocation = selectedLocation === 'ALL' || (p.market_name === selectedLocation || p.market_location === selectedLocation);
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'quantity_desc') return (Number(b.quantity_kg) || 0) - (Number(a.quantity_kg) || 0);
      if (sortBy === 'value_desc') return (Number(b.estimated_value) || 0) - (Number(a.estimated_value) || 0);
      // default newest
      return new Date(b.requested_at || 0) - new Date(a.requested_at || 0);
    });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Live Market Exchange Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Available Pickups Feed</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Browse, filter, and claim daily organic waste batches directly from Bangladesh bazars.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 shrink-0 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>{availablePickups.length} Total Batches Ready</span>
          </div>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by bazar, waste type, notes..."
                className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-sky-500 focus:border-sky-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 bg-white rounded-xl focus:ring-sky-500 focus:border-sky-500 font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 bg-white rounded-xl focus:ring-sky-500 focus:border-sky-500 font-medium"
              >
                <option value="ALL">All Bazars</option>
                {locations.filter(l => l !== 'ALL').map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 bg-white rounded-xl focus:ring-sky-500 focus:border-sky-500 font-medium"
              >
                <option value="newest">Sort: Newest</option>
                <option value="quantity_desc">Quantity: High to Low</option>
                <option value="value_desc">Value: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedCategory !== 'ALL' || selectedLocation !== 'ALL' || searchTerm) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>
                </span>
              )}
              {selectedCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-medium">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')}><X className="w-3 h-3 text-sky-500 hover:text-sky-700" /></button>
                </span>
              )}
              {selectedLocation !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('ALL')}><X className="w-3 h-3 text-emerald-500 hover:text-emerald-700" /></button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedLocation('ALL');
                }}
                className="text-xs text-sky-600 hover:underline font-semibold ml-auto"
              >
                Reset All
              </button>
            </div>
          )}
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
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPickups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <EmptyState
              icon={Truck}
              title={searchTerm || selectedCategory !== 'ALL' ? "No matches found" : "No available pickups right now"}
              description={searchTerm || selectedCategory !== 'ALL' ? "Try adjusting your search query or removing filters to view other batches." : "When a Market Manager logs waste and requests a pickup, it will immediately appear here. Check back soon!"}
              action={
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('ALL');
                    setSelectedLocation('ALL');
                    fetchAvailable();
                  }}
                  className="btn-secondary px-4 py-2 text-xs font-semibold rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 cursor-pointer"
                >
                  Refresh / Reset Feed
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPickups.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs card-hover hover:border-sky-400 flex flex-col justify-between space-y-4 reveal-visible"
                style={{ animationDelay: `${idx * 0.05}s` }}
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
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">{p.market_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" aria-hidden="true" />
                      {p.market_location || p.market_area || 'Dhaka, Bangladesh'}
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
                    <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 italic leading-relaxed">
                      📍 {p.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleAccept(p.id, p.market_name)}
                    disabled={acceptingId === p.id}
                    className="btn-primary w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
