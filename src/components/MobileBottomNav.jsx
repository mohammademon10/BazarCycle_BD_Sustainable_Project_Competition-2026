import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Truck, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * MobileBottomNav
 * A fixed bottom navigation bar optimized for smartphone users in Bangladesh.
 * Gives immediate thumb access to primary tasks based on role.
 */
export default function MobileBottomNav() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'MARKET_MANAGER') return '/manager/dashboard';
    if (user?.role === 'COLLECTOR') return '/collector/dashboard';
    return '/';
  };

  const getMarketplacePath = () => {
    if (user?.role === 'COLLECTOR') return '/collector/available';
    if (user?.role === 'MARKET_MANAGER') return '/manager/waste';
    return '/how-it-works';
  };

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
    },
    {
      to: getMarketplacePath(),
      label: user?.role === 'COLLECTOR' ? 'Pickups' : user?.role === 'MARKET_MANAGER' ? 'My Waste' : 'Explore',
      icon: user?.role === 'COLLECTOR' ? Truck : Store,
    },
    {
      to: getDashboardPath(),
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: isAuthenticated ? getDashboardPath() : '/login',
      label: isAuthenticated ? 'Profile' : 'Sign In',
      icon: User,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 transition-colors select-none
                ${isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}
              `}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
