import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { 
  Recycle, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  Shield, 
  Store, 
  Truck, 
  PlusCircle, 
  BarChart3 
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDemoDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDemoDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDemoDropdownOpen(false);
  }, [location.pathname]);

  const handleDemoSwitch = async (roleKey) => {
    try {
      await quickDemoLogin(roleKey);
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
      if (roleKey === 'ADMIN') navigate('/admin/dashboard');
      else if (roleKey === 'MARKET_MANAGER') navigate('/manager/dashboard');
      else if (roleKey === 'COLLECTOR') navigate('/collector/dashboard');
    } catch (err) {
      console.error('Failed to quick login', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Recycle className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center">
                  BazarCycle <span className="text-emerald-600 ml-1">BD</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider -mt-1 hidden sm:block">
                  Don't Dump It. Cycle It.
                </span>
              </div>
            </Link>

            {/* Public Links (Desktop) */}
            <div className="hidden md:flex md:items-center md:space-x-1 ml-6 lg:ml-8">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                About
              </Link>
              <Link
                to="/how-it-works"
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive('/how-it-works') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                How It Works
              </Link>
              <Link
                to="/impact"
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive('/impact') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Public Impact
              </Link>
            </div>
          </div>

          {/* Right Side: Role Navigation & Auth */}
          <div className="hidden md:flex items-center space-x-2.5 lg:space-x-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={demoDropdownOpen}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className={`w-3 h-3 text-amber-700 transition-transform ${demoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {demoDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-down"
                  role="menu"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Quick Competition Roles</p>
                    <p className="text-[10px] text-slate-400">Instantly switch session in 1-click:</p>
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('MARKET_MANAGER')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-slate-800 flex items-center space-x-2 transition"
                    role="menuitem"
                  >
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Market Manager</p>
                      <p className="text-[10px] text-slate-500">Karwan Bazar (Register waste)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('COLLECTOR')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 text-slate-800 flex items-center space-x-2 transition"
                    role="menuitem"
                  >
                    <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Waste Collector</p>
                      <p className="text-[10px] text-slate-500">Salam Miah (Accept & collect)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 text-slate-800 flex items-center space-x-2 transition"
                    role="menuitem"
                  >
                    <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Platform Admin</p>
                      <p className="text-[10px] text-slate-500">Rahim Ahmed (All markets & metrics)</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                {/* Role specific quick action */}
                {user?.role === 'MARKET_MANAGER' && (
                  <Link
                    to="/manager/waste/create"
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Log Waste
                  </Link>
                )}

                {/* Dashboard Link */}
                <Link
                  to={
                    user?.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user?.role === 'MARKET_MANAGER'
                      ? '/manager/dashboard'
                      : '/collector/dashboard'
                  }
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Dashboard
                </Link>

                {/* User badge */}
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-medium text-slate-700 max-w-[100px] lg:max-w-[130px] truncate">{user?.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    {user?.role === 'MARKET_MANAGER' ? 'Manager' : user?.role}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs lg:text-sm font-semibold rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-3.5 py-1.5 text-xs lg:text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-3 pb-5 space-y-2 bg-white/98 shadow-lg animate-slide-down">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/') ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/about') ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/how-it-works') ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/impact"
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/impact') ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Public Impact
          </Link>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">1-Click Competition Roles</p>
            <div className="grid grid-cols-3 gap-1.5 px-1">
              <button
                type="button"
                onClick={() => handleDemoSwitch('MARKET_MANAGER')}
                className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition text-center"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoSwitch('COLLECTOR')}
                className="px-2 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-lg border border-sky-200 transition text-center"
              >
                Collector
              </button>
              <button
                type="button"
                onClick={() => handleDemoSwitch('ADMIN')}
                className="px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200 transition text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={
                    user?.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user?.role === 'MARKET_MANAGER'
                      ? '/manager/dashboard'
                      : '/collector/dashboard'
                  }
                  className="block w-full text-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  My Dashboard ({user?.role})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=register"
                  className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
