import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  Recycle, 
  Truck, 
  BarChart3, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  Layers,
  ArrowDown
} from 'lucide-react';
import SafeImage from '../../components/SafeImage';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';

export default function LandingPage() {
  const { quickDemoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchPublicMetrics = async () => {
      try {
        const res = await api.get('/impact/summary');
        setMetrics(res.data);
      } catch (e) {
        console.error('Failed to fetch public impact summary', e);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchPublicMetrics();
  }, []);

  const handleDemo = async (role) => {
    try {
      await quickDemoLogin(role);
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'MARKET_MANAGER') navigate('/manager/dashboard');
      else if (role === 'COLLECTOR') navigate('/collector/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll-reveal refs for major sections
  const [metricsRef, metricsVisible] = useScrollReveal({ threshold: 0.2 });
  const [journeyRef, journeyVisible] = useScrollReveal({ threshold: 0.15 });
  const [featuresRef, featuresVisible] = useScrollReveal({ threshold: 0.15 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });

  // Count-up for hero metric stat
  const wasteCount = useCountUp(metrics?.total_waste_registered_kg ?? 0, 1400, metricsVisible);
  const recoveryCount = useCountUp(metrics?.total_waste_recovered_kg ?? 0, 1400, metricsVisible);
  const marketsCount = useCountUp(metrics?.active_markets ?? 0, 1200, metricsVisible);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bangladesh Market Waste Transformation</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Rule-Based Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Turn Market Waste Into <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">Local Resources.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                BazarCycle BD helps local markets track waste, discover resource pathways, connect with collectors, and measure environmental impact.
              </p>

              {/* Tagline Badge */}
              <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 inline-block">
                <p className="text-sm font-bold text-forest-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Tagline: "Don't Dump It. Cycle It."</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login?mode=register"
                  className="btn-primary px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="btn-secondary px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base border border-slate-200"
                >
                  See How It Works
                </Link>
              </div>

              {/* Quick Demo Buttons for Judges */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                  Instant Competition Demo Logins (1-Click):
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDemo('MARKET_MANAGER')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold hover:bg-emerald-200 border border-emerald-300 transition"
                  >
                    🏪 Market Manager (Karwan Bazar)
                  </button>
                  <button
                    onClick={() => handleDemo('COLLECTOR')}
                    className="px-3 py-1.5 rounded-lg bg-sky-100 text-sky-900 text-xs font-semibold hover:bg-sky-200 border border-sky-300 transition"
                  >
                    🚛 Waste Collector (Salam Miah)
                  </button>
                  <button
                    onClick={() => handleDemo('ADMIN')}
                    className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-900 text-xs font-semibold hover:bg-purple-200 border border-purple-300 transition"
                  >
                    🛡️ Platform Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Authentic Photograph from User Uploads */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <SafeImage
                  src="/images/hero_market_bazar.jpg"
                  alt="Vibrant Bangladesh wholesale vegetable bazar with vendors and produce baskets"
                  loading="eager"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent p-4 text-white">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
                    Local Bangladesh Market Context
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-0.5">
                    Authentic wholesale vegetable market in Dhaka (Karwan Bazar wholesale environment)
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE VISUAL JOURNEY FLOW */}
      <section className="py-12 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">End-to-End Cycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              The BazarCycle Waste-to-Resource Journey
            </h2>
            <p className="text-sm text-emerald-200 mt-2">
              From market generation to verified environmental recovery in 6 connected steps.
            </p>
          </div>

          <div ref={journeyRef} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'MARKET', desc: 'Vendor & Market registration', emoji: '🏪' },
              { step: '02', title: 'WASTE', desc: 'Quantity & Category logged', emoji: '📦' },
              { step: '03', title: 'PATHWAY', desc: 'Rule engine recommendation', emoji: '♻️' },
              { step: '04', title: 'COLLECTOR', desc: 'Accepted by local logistics', emoji: '🚛' },
              { step: '05', title: 'RECOVERY', desc: 'Composted or Recycled', emoji: '🌱' },
              { step: '06', title: 'IMPACT', desc: 'CO₂ & Resource verified', emoji: '📊' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`bg-emerald-800/60 border border-emerald-700 rounded-xl p-4 flex flex-col justify-between hover:bg-emerald-700/60 transition-all duration-200 hover:-translate-y-1 ${journeyVisible ? 'reveal-visible' : 'reveal-hidden'}`}
                style={{ animationDelay: journeyVisible ? `${idx * 0.07}s` : '0s' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-emerald-300 tracking-wider">{item.step}</span>
                    <span className="text-lg" aria-hidden="true">{item.emoji}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                </div>
                <p className="text-xs text-emerald-200 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LIVE VERIFIED DATABASE METRICS TICKER */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Database Metrics</span>
              <h3 className="text-xl font-bold text-slate-900">Real Platform Activity Across Dhaka Markets</h3>
            </div>
            <p className="text-xs text-slate-500 italic mt-1 md:mt-0">
              * Figures query live database tables without simulated mockups.
            </p>
          </div>

          <div ref={metricsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`bg-slate-50 p-4 rounded-xl border border-slate-200 card-hover ${metricsVisible ? 'reveal-visible' : 'reveal-hidden'}`}>
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Waste Registered</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {metricsVisible ? wasteCount.toLocaleString() : '...'} <span className="text-sm font-semibold text-slate-500">KG</span>
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Logged by market managers</span>
            </div>

            <div className={`bg-emerald-50 p-4 rounded-xl border border-emerald-200 card-hover ${metricsVisible ? 'reveal-visible' : 'reveal-hidden'}`} style={{ animationDelay: '0.08s' }}>
              <span className="text-xs font-semibold text-emerald-700 uppercase">Total Waste Recovered</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                {metricsVisible ? recoveryCount.toLocaleString() : '...'} <span className="text-sm font-semibold text-emerald-700">KG</span>
              </p>
              <span className="text-[11px] text-emerald-700 mt-1 block">Successfully collected & diverted</span>
            </div>

            <div className={`bg-amber-50 p-4 rounded-xl border border-amber-200 card-hover ${metricsVisible ? 'reveal-visible' : 'reveal-hidden'}`} style={{ animationDelay: '0.16s' }}>
              <span className="text-xs font-semibold text-amber-700 uppercase">Estimated Resource Value</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1 break-words tabular-nums">
                {metrics ? metrics.total_estimated_value_bdt.toLocaleString() : '...'} <span className="text-sm font-semibold text-amber-700">BDT</span>
              </p>
              <span className="text-[11px] text-amber-700 mt-1 block">Estimated value in local currency</span>
            </div>

            <div className={`bg-sky-50 p-4 rounded-xl border border-sky-200 card-hover ${metricsVisible ? 'reveal-visible' : 'reveal-hidden'}`} style={{ animationDelay: '0.24s' }}>
              <span className="text-xs font-semibold text-sky-700 uppercase">Estimated CO₂ Avoided</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-900 mt-1 break-words tabular-nums">
                {metrics ? metrics.total_co2_impact_kg.toLocaleString() : '...'} <span className="text-sm font-semibold text-sky-700">KG</span>
              </p>
              <span className="text-[11px] text-sky-700 mt-1 block">Project Estimate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM SECTION (Section 24) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Image from user uploads */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                <SafeImage
                  src="/images/market_organic_waste.jpg"
                  alt="Heaps of unsegregated organic vegetable market discards under market tarpaulins"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full object-cover"
                />
                <div className="p-3 bg-white border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">
                    Unsegregated organic produce discards accumulation at local wholesale market sheds.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                The Problem
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Market Waste is Misunderstood as Mere Trash.
              </h2>
              <p className="text-base text-slate-700 leading-relaxed font-medium">
                Local markets generate organic and recyclable materials that can potentially be recovered instead of being treated only as waste.
              </p>
              <div className="space-y-3 pt-2 text-sm text-slate-600">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <p>Heaps of clean organic greens and fruit scraps are tossed into mixed open municipal bins.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <p>Valuable transport cardboard and plastic crates are left unsorted, causing secondary contamination.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                  <p>Informal collectors lack a real-time digital notification when clean, bulk batches are available at specific market gates.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. RESOURCE PATHWAY VISUALS (Section 25) */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Rule-Based Recovery</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Deterministic Resource Pathways
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every logged waste category is automatically evaluated through transparent, explainable transformation pathways with estimated BDT valuation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Vegetable/Fruit Waste */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition">
              <SafeImage
                src="/images/composting_organic.jpg"
                alt="Organic vegetable discards in hands for composting"
                aspectRatio="aspect-[4/3]"
              />
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Organic Pathway
                </span>
                <h3 className="font-bold text-base text-slate-900">Vegetable / Fruit Waste</h3>
                <div className="flex items-center text-xs font-bold text-emerald-700 space-x-1">
                  <span>Vegetable Waste</span>
                  <span>↓</span>
                  <span>Composting</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Diverted directly to decentralized bio-composting pits to produce agricultural soil enrichment.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Est. Value:</span>
                  <span className="text-emerald-700 font-bold">12–15 BDT / KG</span>
                </div>
              </div>
            </div>

            {/* Card 2: Plastic Waste */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition">
              <SafeImage
                src="/images/plastic_recycling_cage.jpg"
                alt="Plastic bottles wire recycling collection cage"
                aspectRatio="aspect-[4/3]"
              />
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  Recyclable Pathway
                </span>
                <h3 className="font-bold text-base text-slate-900">Plastic Packaging & PET</h3>
                <div className="flex items-center text-xs font-bold text-sky-700 space-x-1">
                  <span>Plastic</span>
                  <span>↓</span>
                  <span>Recycling</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Baled, washed, and routed to local mechanical plastic granulators and pelletizers.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Est. Value:</span>
                  <span className="text-sky-700 font-bold">35 BDT / KG</span>
                </div>
              </div>
            </div>

            {/* Card 3: Paper / Cardboard */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition">
              <SafeImage
                src="/images/hero_market_bazar.jpg"
                alt="Market packaging paper cartons stacked for recycling"
                aspectRatio="aspect-[4/3]"
              />
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Fiber Pathway
                </span>
                <h3 className="font-bold text-base text-slate-900">Paper & Cardboard</h3>
                <div className="flex items-center text-xs font-bold text-purple-700 space-x-1">
                  <span>Paper/Cardboard</span>
                  <span>↓</span>
                  <span>Paper Recycling</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Bundled corrugated transport boxes redirected to regional cardboard and kraft pulp mills.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Est. Value:</span>
                  <span className="text-purple-700 font-bold">18 BDT / KG</span>
                </div>
              </div>
            </div>

            {/* Card 4: Organic / Fish Waste */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition">
              <SafeImage
                src="/images/market_produce_vendor.jpg"
                alt="Bangladeshi produce market vendor and fresh provisions"
                aspectRatio="aspect-[4/3]"
              />
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Nutrient Pathway
                </span>
                <h3 className="font-bold text-base text-slate-900">Fish & High-Protein Waste</h3>
                <div className="flex items-center text-xs font-bold text-amber-700 space-x-1">
                  <span>Fish Waste</span>
                  <span>↓</span>
                  <span>Organic Recovery</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Chilled fish trimmings converted into nitrogen-rich bio-fertilizer and poultry feed additives.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Est. Value:</span>
                  <span className="text-amber-700 font-bold">25 BDT / KG</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 italic max-w-xl mx-auto">
              Values are project estimates for demonstration purposes and may vary by location, quality, and market conditions.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="py-16 bg-gradient-to-br from-emerald-800 via-forest-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-700/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
            <Recycle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Empowering Dhaka's Circular Economy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Cycle Local Market Waste?
          </h2>

          <p className="text-emerald-100 text-base max-w-2xl mx-auto leading-relaxed">
            Experience the complete flow from waste registration and instant rule-based recommendation to collector acceptance and verified recovery impact.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition shadow-lg"
            >
              Sign In to Platform
            </Link>
            <Link
              to="/impact"
              className="px-6 py-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-500/50 transition"
            >
              View Public Impact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
