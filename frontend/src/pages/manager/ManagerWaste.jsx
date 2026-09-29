import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search,
  Scale
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ManagerWaste() {
  const { user } = useAuth();
  const [wasteRecords, setWasteRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchWaste = async () => {
    try {
      const res = await api.get('/waste');
      setWasteRecords(res.data);
    } catch (err) {
      console.error('Failed to load waste records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaste();
  }, []);

  const handleRequestPickup = async (wasteId) => {
    setRequestingId(wasteId);
    try {
      await api.post('/pickups', {
        waste_record_id: wasteId,
        notes: 'Requested from waste logs'
      });
      await fetchWaste();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to request pickup');
    } finally {
      setRequestingId(null);
    }
  };

  const filtered = wasteRecords.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSearch = !search || 
      r.category_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Market Operations</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Market Waste Registry</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              History of registered waste batches, pathways, and pickup statuses.
            </p>
          </div>

          <Link
            to="/manager/waste/create"
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Register New Waste</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category or notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-3 bg-white focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ACCEPTED">ACCEPTED (In Transit)</option>
              <option value="COLLECTED">COLLECTED (Recovered)</option>
            </select>
          </div>
        </div>

        {/* Waste Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Scale className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No waste batches found matching your filters.</p>
              <Link
                to="/manager/waste/create"
                className="inline-block text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Click here to log a new batch
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-left">Recommended Pathway</th>
                    <th className="px-4 py-3 text-right">Estimated Value</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                        {item.record_date}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {item.category_name}
                        {item.description && (
                          <p className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {item.quantity_kg.toLocaleString()} <span className="text-[10px] text-slate-500 font-semibold">KG</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-700">
                        {item.recommended_pathway}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-amber-800 whitespace-nowrap">
                        {item.estimated_value.toLocaleString()} <span className="text-[10px] text-slate-400">BDT</span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          item.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          item.status === 'AVAILABLE' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {item.status === 'AVAILABLE' && !item.has_pickup_request ? (
                          <button
                            onClick={() => handleRequestPickup(item.id)}
                            disabled={requestingId === item.id}
                            className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold transition"
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            <span>{requestingId === item.id ? 'Requesting...' : 'Request Pickup'}</span>
                          </button>
                        ) : item.status === 'AVAILABLE' ? (
                          <span className="text-[11px] text-sky-700 font-medium flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1" />
                            Awaiting Collector
                          </span>
                        ) : item.status === 'ACCEPTED' ? (
                          <span className="text-[11px] text-amber-700 font-medium flex items-center justify-end">
                            <Truck className="w-3 h-3 mr-1" />
                            Collector En Route
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Recovered
                          </span>
                        )}
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
