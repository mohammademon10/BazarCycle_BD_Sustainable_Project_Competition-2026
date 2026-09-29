import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Recycle, 
  Sparkles, 
  Shield, 
  Store, 
  Truck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, register, quickDemoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' or 'register'
  const [isRegisterMode, setIsRegisterMode] = useState(
    new URLSearchParams(location.search).get('mode') === 'register'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('MARKET_MANAGER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'MARKET_MANAGER') navigate('/manager/dashboard');
      else if (user.role === 'COLLECTOR') navigate('/collector/dashboard');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        const newUser = await register({
          name,
          email,
          phone,
          role,
          password
        });
        if (newUser.role === 'ADMIN') navigate('/admin/dashboard');
        else if (newUser.role === 'MARKET_MANAGER') navigate('/manager/dashboard');
        else navigate('/collector/dashboard');
      } else {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
        else if (loggedUser.role === 'MARKET_MANAGER') navigate('/manager/dashboard');
        else navigate('/collector/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await quickDemoLogin(roleKey);
      if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedUser.role === 'MARKET_MANAGER') navigate('/manager/dashboard');
      else if (loggedUser.role === 'COLLECTOR') navigate('/collector/dashboard');
    } catch (err) {
      setError('Failed to log in with demo account. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Recycle className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              BazarCycle <span className="text-emerald-600">BD</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider -mt-1">
              Don't Dump It. Cycle It.
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          {isRegisterMode ? 'Create New Account' : 'Sign In to Your Workspace'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Secure Role-Based Access for Markets, Collectors & Administrators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick Demo Credentials Panel */}
        <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              1-Click Competition Demo Logins
            </h3>
          </div>
          <p className="text-[11px] text-amber-800 mb-3">
            Select a role to instantly test live features with pre-seeded data:
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('MARKET_MANAGER')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-amber-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 transition text-xs font-semibold shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Market Manager (Karwan Bazar)</p>
                  <p className="text-[10px] text-slate-500">manager@bazarcycle.bd</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('COLLECTOR')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-amber-200 hover:border-sky-500 hover:bg-sky-50/50 text-slate-800 transition text-xs font-semibold shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Waste Collector (Salam Miah)</p>
                  <p className="text-[10px] text-slate-500">collector@bazarcycle.bd</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-amber-200 hover:border-purple-500 hover:bg-purple-50/50 text-slate-800 transition text-xs font-semibold shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Platform Administrator</p>
                  <p className="text-[10px] text-slate-500">admin@bazarcycle.bd</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Regular Login / Register Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rafiqul Alam"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number (Optional)</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+88017..."
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 text-sm border border-slate-300 bg-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="MARKET_MANAGER">Market Manager (Manage Bazar & Log Waste)</option>
                    <option value="COLLECTOR">Waste Collector (Transport & Recover)</option>
                    <option value="ADMIN">Platform Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@bazarcycle.bd"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            {isRegisterMode ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Need a new profile?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
