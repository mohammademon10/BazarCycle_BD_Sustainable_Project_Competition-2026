import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Recycle, 
  Leaf, 
  Truck, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Store
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import ScoreGauge from '../../components/ScoreGauge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [market, setMarket] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [recentWaste, setRecentWaste] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [marketRes, statsRes, wasteRes] = await Promise.all([
          api.get('/markets/my/market'),
          api.get('/dashboard/stats'),
          api.get('/waste?limit=5')
        ]);

        setMarket(marketRes.data);
        setStats(statsRes.data);
        setRecentWaste(wasteRes.data);

        // Fetch score if market exists
        if (marketRes.data?.id) {
          const scoreRes = await api.get(`/sustainability/market/${marketRes.data.id}`);
          setScoreData(scoreRes.data);
        }
      } catch (err) {
        console.error('Failed to load manager dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading market operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Market Banner Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-forest-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
              <Store className="w-3.5 h-3.5" />
              <span>Assigned Market Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {market ? market.name : 'Karwan Bazar Demo Market'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Location: {market?.location || 'Tejgaon, Dhaka 1215'} • Manager: {user?.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/manager/waste/create"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 shadow-md transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Log Waste Batch</span>
            </Link>
            <Link
              to="/manager/pickups"
              className="px-5 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-500/50 transition flex items-center space-x-1.5"
            >
              <Truck className="w-4 h-4 text-emerald-300" />
              <span>Track Pickups</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Registered"
            value={stats ? stats.total_waste_registered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Logged market discards"
            icon={Layers}
            colorScheme="slate"
          />

          <StatCard
            title="Total Recovered"
            value={stats ? stats.total_waste_recovered_kg.toLocaleString() : '0'}
            unit="KG"
            subtitle="Diverted to recycling/compost"
            icon={Recycle}
            colorScheme="emerald"
            badge={`${stats?.pickup_completion_rate || 0}% Cleared`}
          />

          <StatCard
            title="Estimated Resource Value"
            value={stats ? stats.estimated_resource_value_bdt.toLocaleString() : '0'}
            unit="BDT"
            subtitle="Project Estimate for demo"
            icon={DollarSign}
            colorScheme="amber"
          />

          <StatCard
            title="Pending Collections"
            value={stats ? stats.pending_pickups_count : '0'}
            unit="Batches"
            subtitle="Available or In-Transit"
            icon={Truck}
            colorScheme="blue"
          />
        </div>

        {/* Sustainability Score & Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sustainability Score Gauge: 4 cols */}
          <div className="lg:col-span-4">
            <ScoreGauge
              score={scoreData?.total_score || stats?.sustainability_score || 0}
              label={scoreData?.score_label || stats?.sustainability_label || 'Needs Improvement'}
              components={scoreData}
              showBreakdown={true}
            />
          </div>

          {/* Chart.js Categories Breakdown: 4 cols */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Stream Breakdown</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Waste by Category</h3>
            </div>
            <div className="relative h-56 w-full flex items-center justify-center my-2">
              {stats?.chart_waste_by_category ? (
                <Doughnut
                  data={stats.chart_waste_by_category}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">Calculated from market records</p>
          </div>

          {/* Monthly Waste Trend: 4 cols */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Historical Trend</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Monthly Volume</h3>
            </div>
            <div className="relative h-56 w-full my-2">
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
            <p className="text-[11px] text-slate-400 text-center italic">Monthly registered volume (KG)</p>
          </div>

        </div>

        {/* Recent Registered Waste Stream Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Waste Batches</h3>
              <p className="text-xs text-slate-500">Latest batches logged for this market.</p>
            </div>
            <Link
              to="/manager/waste"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>View Full Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Category</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-left">Pathway</th>
                  <th className="py-2.5 px-3 text-right">Est. Value</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentWaste.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{item.record_date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.category_name}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                      {item.quantity_kg.toLocaleString()} KG
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">{item.recommended_pathway}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                      {item.estimated_value.toLocaleString()} BDT
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        item.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-sky-100 text-sky-800 border-sky-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
