import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles, 
  Leaf, 
  Recycle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Scale,
  Truck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ManagerWasteCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [markets, setMarkets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [quantityKg, setQuantityKg] = useState('150');
  const [description, setDescription] = useState('Morning fresh vegetable trimmings and cabbage discards');
  const [autoRequestPickup, setAutoRequestPickup] = useState(true);
  const [pickupNotes, setPickupNotes] = useState('Gate 2 wholesale collection shed, loaded in standard baskets');

  // Real-time recommendation preview
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Load markets and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsRes, catsRes] = await Promise.all([
          api.get('/markets'),
          api.get('/waste/categories')
        ]);
        setMarkets(marketsRes.data);
        setCategories(catsRes.data);

        // Preselect market
        if (marketsRes.data.length > 0) {
          const myMarket = marketsRes.data.find(m => m.manager_id === user?.id) || marketsRes.data[0];
          setSelectedMarketId(myMarket.id);
        }

        // Preselect Vegetable Waste for the competition demo flow
        if (catsRes.data.length > 0) {
          const vegCat = catsRes.data.find(c => c.name.toLowerCase().includes('veg')) || catsRes.data[0];
          setSelectedCategoryId(vegCat.id);
        }
      } catch (err) {
        console.error('Failed to load form prerequisites', err);
      }
    };
    fetchData();
  }, [user]);

  // 2. Fetch real-time rule recommendation whenever category or quantity changes
  useEffect(() => {
    const fetchRecommendation = async () => {
      const qtyNum = parseFloat(quantityKg);
      if (!selectedCategoryId || isNaN(qtyNum) || qtyNum <= 0) {
        setRecommendation(null);
        return;
      }

      setLoadingRec(true);
      try {
        const res = await api.post('/waste/recommend', {
          category_id: selectedCategoryId,
          quantity_kg: qtyNum
        });
        setRecommendation(res.data);
      } catch (err) {
        console.error('Failed to get recommendation', err);
        setRecommendation(null);
      } finally {
        setLoadingRec(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRecommendation();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategoryId, quantityKg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      setError('Waste quantity must be strictly greater than 0 KG.');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Create Waste Record
      const wasteRes = await api.post('/waste', {
        market_id: selectedMarketId,
        category_id: selectedCategoryId,
        quantity_kg: qty,
        description: description.trim()
      });

      const createdWaste = wasteRes.data;

      // Step 2: Auto Request Pickup if checked
      if (autoRequestPickup) {
        await api.post('/pickups', {
          waste_record_id: createdWaste.id,
          notes: pickupNotes.trim()
        });
      }

      setSuccess('Waste batch registered and pickup request created successfully!');
      setTimeout(() => {
        navigate('/manager/waste');
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to register waste record.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/manager/dashboard" className="hover:text-emerald-700">Market Manager</Link>
          <span>/</span>
          <Link to="/manager/waste" className="hover:text-emerald-700">Waste Records</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Register New Batch</span>
        </div>

        {/* Page Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 1 & 2 of Core Demo</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Register Market Waste Batch</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Input market waste streams to trigger the deterministic transformation engine.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs font-semibold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Rule Engine Active</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Form and Real-time Recommendation Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Market */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Market
                </label>
                <select
                  value={selectedMarketId}
                  onChange={(e) => setSelectedMarketId(e.target.value)}
                  required
                  className="mt-1 block w-full py-2.5 px-3 text-sm border border-slate-300 bg-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                >
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Waste Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Waste Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  required
                  className="mt-1 block w-full py-2.5 px-3 text-sm border border-slate-300 bg-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — ({c.waste_type} • Est. {c.estimated_value_per_kg} BDT/KG)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity in KG */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity (KG) <span className="text-rose-500">* Required &gt; 0</span>
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="150"
                    className="block w-full py-2.5 pl-4 pr-12 text-sm border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 font-bold"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    KG
                  </div>
                </div>
              </div>

              {/* Batch Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Batch Description / Notes
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Cabbage leaves, spinach, and vegetable cutoffs from wholesale shed 4"
                  className="mt-1 block w-full py-2 px-3 text-sm border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Instant Pickup Request Checkbox */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRequestPickup}
                    onChange={(e) => setAutoRequestPickup(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Immediately Request Pickup (Creates AVAILABLE pickup request)
                  </span>
                </label>

                {autoRequestPickup && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="Pickup instructions for collector (e.g. Gate 2)"
                      className="block w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{submitting ? 'Registering...' : 'Register Waste & Request Pickup'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Recommendation Engine Output Card (Prompt Section 10 & 11) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-forest-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Engine Recommendation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  Deterministic
                </span>
              </div>

              {recommendation ? (
                <div className="space-y-4 mt-4">
                  {/* Category & Pathway */}
                  <div>
                    <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">
                      Recommended Pathway
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5 flex items-center space-x-2">
                      <Recycle className="w-5 h-5 text-emerald-400" />
                      <span>{recommendation.recommended_pathway}</span>
                    </h3>
                  </div>

                  {/* Estimated Resource Value (Section 11) */}
                  <div className="p-4 rounded-xl bg-emerald-800/50 border border-emerald-700/60">
                    <span className="text-[11px] font-bold uppercase text-amber-300 tracking-wider">
                      Estimated Resource Value
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-amber-300">
                        {recommendation.estimated_value.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-amber-400">BDT</span>
                    </div>
                    <p className="text-[11px] text-emerald-200 mt-1">
                      Calculation: {recommendation.quantity_kg} KG × {recommendation.unit_rate_bdt} BDT/KG
                    </p>
                  </div>

                  {/* Explainable Rationale */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1" />
                      Explanation
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/40">
                      {recommendation.explanation}
                    </p>
                  </div>

                  {/* CO2 Factor */}
                  <div className="flex items-center justify-between text-xs text-emerald-200 pt-1">
                    <span>CO₂ Avoided (Project Estimate):</span>
                    <span className="font-bold text-white">{recommendation.co2_impact_estimate} KG</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-emerald-300 text-xs space-y-2">
                  <Scale className="w-8 h-8 mx-auto opacity-50" />
                  <p>Enter quantity &gt; 0 KG to see live rule-based recommendation.</p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="pt-3 border-t border-emerald-800/80 text-[10px] text-emerald-300/80 leading-normal italic">
              * Values are project estimates for demonstration purposes and may vary by location, quality, and market conditions.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
