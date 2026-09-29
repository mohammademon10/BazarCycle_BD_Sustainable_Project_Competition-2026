import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Recycle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight,
  MapPin,
  Leaf
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

import { SkeletonCard } from '../../components/ui';

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [activePickups, setActivePickups] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, availRes, myActiveRes, myHistRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/pickups/available'),
          api.get('/pickups/my?status_filter=ACCEPTED'),
          api.get('/pickups/my?status_filter=COLLECTED')
        ]);
        setStats(statsRes.data);
        setAvailableCount(availRes.data.length);
        setActivePickups(myActiveRes.data);
        setHistory(myHistRes.data);
      } catch (err) {
        console.error('Failed to load collector dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-slate-200 h-32 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const totalMyRecovered = history.reduce((sum, p) => sum + p.quantity_kg, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-800/60 border border-sky-500/40 text-xs font-semibold text-sky-200">
              <Truck className="w-3.5 h-3.5" />
              <span>Collector Logistics Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
              Connecting local Dhaka vegetable & recyclable waste directly with municipal compost and processing centers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/collector/available"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <span>View Available Pickups ({availableCount})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/collector/pickups"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center space-x-1.5"
            >
              <span>Active In-Transit ({activePickups.length})</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Opportunities"
            value={availableCount}
            unit="Batches"
            subtitle="Ready for pickup across markets"
            icon={Clock}
            colorScheme="blue"
          />

          <StatCard
            title="Active In-Transit"
            value={activePickups.length}
            unit="Batches"
            subtitle="Accepted by you, awaiting dropoff"
            icon={Truck}
            colorScheme="amber"
          />

          <StatCard
            title="My Recovered Tonnage"
            value={totalMyRecovered.toLocaleString()}
            unit="KG"
            subtitle="Collected & safely delivered"
            icon={Recycle}
            colorScheme="emerald"
          />

          <StatCard
            title="Platform Diverted"
            value={stats ? stats.total_waste_recovered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Total waste saved from dump"
            icon={Leaf}
            colorScheme="slate"
          />
        </div>

        {/* Active Jobs Section */}
        {activePickups.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-900 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>You Have {activePickups.length} Accepted Pickup(s) Pending Collection</span>
              </h3>
              <Link
                to="/collector/pickups"
                className="text-xs font-bold text-amber-900 underline"
              >
                Go to Active Pickups
              </Link>
            </div>
          </div>
        )}

        {/* Recent Collection History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Recent Collection Log</h3>
            <Link
              to="/collector/history"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center space-x-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Recycle className="w-7 h-7 text-slate-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-slate-600">No collections recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Accept a pickup from the feed and mark it as collected — it will appear here.</p>
              <Link to="/collector/available" className="btn-primary mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                Browse Available Pickups
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="py-2 px-3 text-left">Collected At</th>
                    <th className="py-2 px-3 text-left">Market</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-left">Pathway</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">
                        {p.collected_at ? new Date(p.collected_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.market_name}</td>
                      <td className="py-2.5 px-3 font-medium">{p.category_name}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {p.quantity_kg} KG
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">{p.recommended_pathway}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          COLLECTED
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
