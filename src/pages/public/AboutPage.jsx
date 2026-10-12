import React from 'react';
import { Leaf, ShieldCheck, Target, Layers, Globe, Award, CheckCircle } from 'lucide-react';
import SafeImage from '../../components/SafeImage';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mission & Context</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About BazarCycle BD
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            A technology platform built specifically for Bangladesh's vibrant local agricultural bazars to transform organic discards and post-consumer packaging into valuable local resources.
          </p>
        </div>

        {/* Story & Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Bangladesh’s Bazars are Vital Economic Hubs.
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every day, wholesale and retail bazars like Karwan Bazar, Jatrabari, and Mirpur process hundreds of tons of fresh seasonal produce arriving from farms across the country. In this intense trade environment, significant volumes of organic trimmings, damaged fruits, and discarded transport packaging accumulate.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Traditionally, these materials are swept into mixed municipal waste heaps, releasing methane in landfills. <strong>BazarCycle BD</strong> bridges this gap: by providing market managers with an immediate, rule-based categorization system and direct connectivity to local composters and recycling collectors.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Context Note:</strong> BazarCycle BD operates as an independent digital pilot. We do not claim official municipal governance integration or municipal partnerships.
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden shadow-md">
              <SafeImage
                src="/images/market_produce_vendor.jpg"
                alt="Bangladeshi produce market vendor displaying fresh vegetables"
                aspectRatio="aspect-[4/3]"
              />
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                Fresh produce retail vendor in a local Dhaka neighborhood bazar.
              </div>
            </div>
          </div>
        </div>

        {/* UN SDG Alignment (Section 46) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900">
              United Nations Sustainable Development Goals Alignment
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Measurable, explainable contribution to global sustainability priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SDG 11 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg">
                11
              </div>
              <h3 className="font-bold text-lg text-slate-900">SDG 11: Sustainable Cities & Communities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target 11.6: Reduces adverse per-capita urban environmental impact by ensuring decentralized organic waste segregation and collection at municipal wholesale markets, keeping public spaces cleaner.
              </p>
            </div>

            {/* SDG 12 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                12
              </div>
              <h3 className="font-bold text-lg text-slate-900">SDG 12: Responsible Consumption & Production</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target 12.5: Substantially reduces market waste generation through prevention, reduction, recycling, and organic composting reuse pathways rather than single-use disposal.
              </p>
            </div>

            {/* SDG 13 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-lg">
                13
              </div>
              <h3 className="font-bold text-lg text-slate-900">SDG 13: Climate Action</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target 13.3: Diverts wet organic matter from anaerobic decomposition in landfill open dumps, preventing greenhouse gas (methane) emissions through rapid aerobic composting.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Philosophy & Transparency */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Design Principles & Constraints
            </span>
            <h3 className="text-2xl font-bold mt-1 text-white">Why Deterministic Rules Over Black-Box ML?</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              In real market operations across Bangladesh, managers and collectors need predictable, transparent, and explainable categorization. A deterministic rule-based engine eliminates hallucinations, prevents external API fees, operates in low-latency environments, and guarantees auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Fake Dashboards</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No Black-Box ML</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transparent BDT Valuation</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Supabase Postgres ORM</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
