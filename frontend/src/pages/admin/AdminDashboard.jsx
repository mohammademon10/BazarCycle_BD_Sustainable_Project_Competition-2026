import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Store, 
  Truck, 
  Recycle, 
  Layers, 
  Users, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Settings
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import ScoreGauge from '../../components/ScoreGauge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, marketsRes, usersRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/markets'),
          api.get('/auth/users')
        ]);
        setStats(statsRes.data);
        setMarkets(marketsRes.data);
        setUsersCount(usersRes.data.length);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading system overview...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              BazarCycle BD Platform Command
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Platform-wide waste tracking, decentralized markets oversight, and verified sustainability analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/markets"
              className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
            >
              Manage Markets ({markets.length})
            </Link>
            <Link
              to="/admin/categories"
              className="px-4 py-2 bg-purple-800/80 hover:bg-purple-800 text-white font-semibold text-xs border border-purple-600/50 rounded-xl transition"
            >
              Categories & Pathways
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-purple-800/80 hover:bg-purple-800 text-white font-semibold text-xs border border-purple-600/50 rounded-xl transition"
            >
              Users ({usersCount})
            </Link>
          </div>
        </div>

        {/* Platform KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Waste"
            value={stats ? stats.total_waste_registered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Across all Dhaka markets"
            icon={Layers}
            colorScheme="slate"
          />

          <StatCard
            title="Total Recovered Waste"
            value={stats ? stats.total_waste_recovered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Diverted from open dumps"
            icon={Recycle}
            colorScheme="emerald"
            badge={`${stats?.pickup_completion_rate || 0}% Completion`}
          />

          <StatCard
            title="Estimated Value"
            value={stats ? stats.estimated_resource_value_bdt.toLocaleString() : '0'}
            unit="BDT"
            subtitle="Project Estimate for demo"
            icon={DollarSign}
            colorScheme="amber"
          />

          <StatCard
            title="Active Registered Markets"
            value={markets.length}
            unit="Markets"
            subtitle="Under digital monitoring"
            icon={Store}
            colorScheme="purple"
          />
        </div>

        {/* 4 Required Chart.js Datasets (Section 14) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Waste by Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">1. Category Breakdown</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Waste by Category (KG)</h3>
            </div>
            <div className="h-64 my-4 flex items-center justify-center">
              {stats?.chart_waste_by_category ? (
                <Doughnut
                  data={stats.chart_waste_by_category}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">Live distribution from waste_records</p>
          </div>

          {/* Chart 2: Monthly Waste */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">2. Monthly Trend</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Monthly Waste Registered (KG)</h3>
            </div>
            <div className="h-64 my-4">
              {stats?.chart_monthly_waste ? (
                <Bar
                  data={stats.chart_monthly_waste}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: '#f8fafc' } } }
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">Calculated over past 6 calendar periods</p>
          </div>

          {/* Chart 3: Recovery Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">3. Recovery Ratio</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Recovery vs Residual Waste</h3>
            </div>
            <div className="h-64 my-4 flex items-center justify-center">
              {stats?.chart_recovery_trend ? (
                <Doughnut
                  data={stats.chart_recovery_trend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">Diverted tonnage vs awaiting collection</p>
          </div>

          {/* Chart 4: Resource Pathway Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">4. Pathway Allocation</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Resource Pathway Distribution</h3>
            </div>
            <div className="h-64 my-4 flex items-center justify-center">
              {stats?.chart_resource_pathway ? (
                <Doughnut
                  data={stats.chart_resource_pathway}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">Composting, Recycling, Organic Fertilizer</p>
          </div>
        </div>

        {/* Quick Admin Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/waste"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm"
          >
            <h4 className="font-bold text-sm text-slate-900">All Waste Logs</h4>
            <p className="text-xs text-slate-500 mt-1">Inspect individual market batches</p>
          </Link>

          <Link
            to="/admin/pickups"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm"
          >
            <h4 className="font-bold text-sm text-slate-900">All Pickup Requests</h4>
            <p className="text-xs text-slate-500 mt-1">Logistics and status audits</p>
          </Link>

          <Link
            to="/admin/reports"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm"
          >
            <h4 className="font-bold text-sm text-slate-900">Compliance Reports</h4>
            <p className="text-xs text-slate-500 mt-1">Exportable environmental metrics</p>
          </Link>

          <Link
            to="/admin/markets"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm"
          >
            <h4 className="font-bold text-sm text-slate-900">Register New Market</h4>
            <p className="text-xs text-slate-500 mt-1">Add local bazars across Bangladesh</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
