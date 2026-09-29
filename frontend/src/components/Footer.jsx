import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Globe, Leaf, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                BazarCycle <span className="text-emerald-400">BD</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don't Dump It. Cycle It. A decentralized sustainability platform redirecting Bangladesh's market waste into composting, recycling, and verified bio-resources.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">About BazarCycle</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition">How It Works</Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-emerald-400 transition">Public Impact Dashboard</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">Sign In / Demo Login</Link>
              </li>
            </ul>
          </div>

          {/* SDG Alignment */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">UN SDG Alignment</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-amber-400">SDG 11:</span> Sustainable Cities & Communities
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-emerald-400">SDG 12:</span> Responsible Consumption & Production
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-sky-400">SDG 13:</span> Climate Action (Avoided Methane)
              </div>
            </div>
          </div>

          {/* Legal / Estimates Disclaimer */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Notice & Transparency</h4>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-[11px] text-slate-400 leading-normal space-y-2">
              <p>
                <strong>Estimated Resource Values:</strong> Values in BDT are project estimates for competition demonstration purposes and may vary by location, quality, and market conditions.
              </p>
              <p>
                <strong>CO₂ Impact:</strong> Clearly designated as a <em>Project Estimate</em> based on standard landfill diversion benchmarks.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BazarCycle BD. Built for sustainability in Bangladesh.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span>Deterministic Rule-Engine</span>
            <span>•</span>
            <span>FastAPI + React</span>
            <span>•</span>
            <span>Supabase PostgreSQL Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
