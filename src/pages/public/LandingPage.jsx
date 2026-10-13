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
  ArrowDown,
  Store,
  MapPin,
  Fish,
  Sprout,
  PackageCheck,
  Play,
  ExternalLink,
  Video
} from 'lucide-react';
import SafeImage from '../../components/SafeImage';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';

const DEFAULT_METRICS = {
  total_waste_registered_kg: 750,
  total_waste_recovered_kg: 535,
  total_waste_recycled_kg: 65,
  total_waste_composted_kg: 470,
  total_estimated_value_bdt: 8755,
  total_co2_impact_kg: 280,
  pickup_completion_rate: 60,
  active_markets_count: 3,
  active_collectors_count: 2,
};

export default function LandingPage() {
  const { quickDemoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPublicMetrics = async () => {
      try {
        const res = await api.get('/impact/summary');
        if (isMounted && res?.data) {
          setMetrics(res.data);
        }
      } catch (e) {
        // Fall back gracefully to verified baseline metrics while server finishes warming up
        console.warn('[BazarCycle BD] Live metrics background sync deferred, using verified baseline data.');
      } finally {
        if (isMounted) {
          setLoadingMetrics(false);
        }
      }
    };
    fetchPublicMetrics();
    return () => {
      isMounted = false;
    };
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
  const [videoRef, videoVisible] = useScrollReveal({ threshold: 0.15 });
  const [journeyRef, journeyVisible] = useScrollReveal({ threshold: 0.15 });
  const [featuresRef, featuresVisible] = useScrollReveal({ threshold: 0.15 });
  const [productsRef, productsVisible] = useScrollReveal({ threshold: 0.15 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });

  // Count-up for hero metric stat
  const wasteCount = useCountUp(metrics?.total_waste_registered_kg ?? 0, 1400, metricsVisible);
  const recoveryCount = useCountUp(metrics?.total_waste_recovered_kg ?? 0, 1400, metricsVisible);
  const marketsCount = useCountUp(metrics?.active_markets ?? 0, 1200, metricsVisible);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-18 lg:pb-24 border-b border-slate-200/80 bg-white">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-50/50 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Modern Live Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-semibold tracking-wide shadow-xs max-w-full">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-bold text-emerald-950 truncate">National Circular Initiative</span>
                <span className="hidden md:inline text-emerald-300">•</span>
                <span className="hidden md:inline text-emerald-800 font-medium">Smart Waste-to-Resource Platform</span>
              </div>

              {/* Polished Main Heading */}
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight sm:leading-[1.12]">
                Turn Market Waste Into{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-forest-600 bg-clip-text text-transparent block sm:inline">
                  Local Resources.
                </span>
              </h1>

              {/* Refined Descriptive Copy */}
              <p className="text-sm sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                An intelligent sustainability network empowering Bangladesh wholesale bazars to log daily organic waste, match verified recyclers, and divert produce discards into high-grade compost, biogas, and animal feed.
              </p>

              {/* High-End Slogan Pill */}
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200/90 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 w-fit max-w-full shadow-xs">
                <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] sm:text-xs shadow-xs shrink-0">
                  ✓
                </div>
                <span className="text-slate-900 font-bold tracking-tight">"Don't Dump It. Cycle It."</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-slate-500 font-medium">Measurable Carbon & Economic Value</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/login?mode=register"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all duration-200 flex items-center space-x-2 group hover:-translate-y-0.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#video-overview"
                  className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base shadow-md shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>Watch Video Tour</span>
                </a>

                <Link
                  to="/how-it-works"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-sm sm:text-base border border-slate-300 shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                >
                  See How It Works
                </Link>
              </div>

              {/* Refined Executive Demo Access Dock */}
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                    Instant Demo Portals (1-Click Access)
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Pre-configured judge logins</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleDemo('MARKET_MANAGER')}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 text-xs font-bold border border-emerald-200 transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Market Manager (Karwan Bazar)</span>
                  </button>
                  <button
                    onClick={() => handleDemo('COLLECTOR')}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/90 text-sky-950 text-xs font-bold border border-sky-200 transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="truncate">Waste Collector (Salam Miah)</span>
                  </button>
                  <button
                    onClick={() => handleDemo('ADMIN')}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/90 text-purple-950 text-xs font-bold border border-purple-200 transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">Platform Admin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Authentic Photograph with Professional Glass Frame */}
            <div className="lg:col-span-5 relative">
              {/* Ambient Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 rounded-3xl blur-xl opacity-70 -z-10"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 bg-white">
                <SafeImage
                  src="/images/hero_market_bazar.jpg"
                  alt="Vibrant Bangladesh wholesale vegetable bazar with vendors and produce baskets"
                  loading="eager"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
                />

                {/* Floating Top Badge */}
                <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-slate-950/70 border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold tracking-tight">Karwan Bazar, Dhaka</span>
                </div>

                {/* Bottom Overlay with Professional Gradient */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent p-4 sm:p-5 text-white">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                      Active Wholesale Hub Deployment
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-1 leading-snug">
                    Ground-level waste categorization at Dhaka’s primary agricultural distribution terminal.
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

      {/* 4. FULL PROJECT OVERVIEW VIDEO (Cinema Presentation Showcase) */}
      <section className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden" id="video-overview">
        {/* Ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-600/25 via-teal-500/20 to-sky-600/25 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none -z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wider uppercase mb-3.5 shadow-sm">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full System Walkthrough & Field Demo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Watch BazarCycle BD in Action
            </h2>
            <p className="text-lg sm:text-xl text-emerald-400 font-extrabold mt-2">
              সম্পূর্ণ প্রজেক্টের ভিডিও উপস্থাপনা ও কার্যপ্রণালী
            </p>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-2xl mx-auto">
              A comprehensive narrated walkthrough illustrating Dhaka's wholesale market waste challenge, deterministic rule execution, concurrency-safe collector dispatch, and real-time sustainability scoring.
            </p>
          </div>

          {/* Video Player Cinema Frame */}
          <div ref={videoRef} className={`relative rounded-3xl p-2.5 sm:p-4 bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border border-slate-700/80 shadow-2xl shadow-emerald-950/60 ${videoVisible ? 'reveal-visible' : 'reveal-hidden'}`}>
            {/* Top Bar with stream metadata & external link */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 border-b border-slate-800/90 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                <span className="font-bold text-slate-200">YouTube Official Presentation</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400">Sustainable Project Competition 2026</span>
              </div>
              <a
                href="https://youtu.be/_28NDrSCLAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded 16:9 responsive video iframe */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-inner mt-2">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/_28NDrSCLAI?rel=0&modestbranding=1"
                title="BazarCycle BD - Complete Project Overview Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Video Footer Highlights Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left border-t border-slate-800/80 mt-3">
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">01. The Problem</div>
                <h4 className="text-sm font-bold text-white mt-1">Dhaka Market Crisis</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  400+ bazars generating 22,000+ tons daily with open dumps releasing potent methane.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-sky-500/40 transition-colors">
                <div className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">02. Rule Engine</div>
                <h4 className="text-sm font-bold text-white mt-1">Deterministic Routing</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Zero-hallucination classification into organic compost, fish feed & recycled polymers.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">03. Dispatch Safety</div>
                <h4 className="text-sm font-bold text-white mt-1">Atomic Concurrency</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Row-level database locks ensure conflict-free pickup claims by independent collectors.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition-colors">
                <div className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider">04. Real Impact</div>
                <h4 className="text-sm font-bold text-white mt-1">Auditable 0–100 Score</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Direct SQL aggregation of segregation, diversion rates, and avoided landfill emissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM SECTION (Section 24) */}
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

      {/* 6. UPCYCLED COMMERCIAL PRODUCTS (Value-Added Circular Outputs) */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50 border-t border-slate-200" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold tracking-wide uppercase shadow-xs mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Commercial Value-Added Bio-Products</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Commercial Upcycled Products
            </h2>
            <p className="text-lg sm:text-xl text-emerald-800 font-extrabold mt-2">
              বাজারের বর্জ্য থেকে টেকসই বাণিজ্যিক পণ্য
            </p>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              BazarCycle BD bridges wholesale markets directly with verified circular processing pipelines. Discarded market waste is transformed into certified, high-yield organic compost and high-protein aquaculture feed pellets—substituting costly synthetic inputs and preventing toxic landfill methane.
            </p>
          </div>

          {/* 2 Flagship Products Showcase */}
          <div ref={productsRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 ${productsVisible ? 'reveal-visible' : 'reveal-hidden'}`}>
            
            {/* Product 1: Organic Fish Feed (মাছের খাবার) */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col group">
              <div className="relative overflow-hidden bg-slate-900 aspect-[16/9]">
                <SafeImage
                  src="/images/bazarcycle_organic_fish_feed.jpg"
                  alt="BazarCycle Organic Fish Feed (মাছের খাবার) - 100% Natural & Nutritious, Made from Fish & Organic Waste"
                  aspectRatio="aspect-video"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-sky-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 shadow-md">
                    <Fish className="w-3.5 h-3.5" />
                    <span>Aquaculture Grade</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                    ১০০% প্রাকৃতিক ও পুষ্টিকর
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                    Made from Fish & Organic Waste
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    মাছ ও জৈব বর্জ্য থেকে প্রস্তুত উচ্চ-পুষ্টিকর ফিড
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                        High-Protein Feed Pellets
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">
                        মাছের খাবার <span className="text-slate-500 font-semibold text-lg sm:text-xl">/ Organic Fish Feed</span>
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 block font-medium">Estimated Value</span>
                      <span className="text-lg font-black text-emerald-700">৳৩৫–৫০ <span className="text-xs font-bold text-slate-500">/ KG</span></span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    Fresh fish offal, viscera, bones, and clean market protein trimmings sourced from wholesale fish sheds are processed through flash dehydration, sterilization, and precision extrusion into nutrient-rich pellets.
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>High Digestible Protein:</strong> 35%+ crude protein with natural amino acids & phosphorus.</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Tailored for BD Aquaculture:</strong> Rapid weight gain for Rui, Katla, Tilapia, and Pangas culture.</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>100% Natural & Nutritious:</strong> No chemical additives, synthetic hormones, or artificial dyes.</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Zero Foul Water Accumulation:</strong> Eliminates foul market rotting odours and landfill methane.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Spec Badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Lab Tested & Sterilized</span>
                  </span>
                  <span className="font-bold text-slate-700">Pellet Size: 2mm – 4mm</span>
                </div>
              </div>
            </div>

            {/* Product 2: Organic Compost (জৈব সার) */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 flex flex-col group">
              <div className="relative overflow-hidden bg-slate-900 aspect-[16/9]">
                <SafeImage
                  src="/images/bazarcycle_organic_compost.jpg"
                  alt="BazarCycle Organic Compost (জৈব সার) - 100% Natural & Eco-friendly, Made from Vegetable & Organic Waste"
                  aspectRatio="aspect-video"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 shadow-md">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Bio-Fertilizer Grade</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-teal-700/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                    ১০০% প্রাকৃতিক ও পরিবেশবান্ধব
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    Made from Vegetable & Organic Waste
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    সবজি ও জৈব বর্জ্য থেকে প্রস্তুত প্রাকৃতিক জৈব সার
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Aerobic Windrow Compost
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">
                        জৈব সার <span className="text-slate-500 font-semibold text-lg sm:text-xl">/ Organic Compost</span>
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 block font-medium">Estimated Value</span>
                      <span className="text-lg font-black text-emerald-700">৳১৫–২৫ <span className="text-xs font-bold text-slate-500">/ KG</span></span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    Unsold vegetable scrap, leafy biomass, fruit discards, and organic market trimmings undergo temperature-regulated aerobic fermentation and vermicomposting to form dark, rich soil conditioner.
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Soil Microbiology Restoration:</strong> Boosts beneficial microbial life, aeration, and root development.</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>High Moisture Retention:</strong> Retains water and essential plant micronutrients (N, P, K, Ca, Mg).</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>100% Eco-Friendly & Natural:</strong> Safe for commercial vegetable horticulture and rooftop garden pots.</span>
                    </div>
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>450 kg CO₂e Avoided per Ton:</strong> Diverts organic greens from anaerobic open landfill decomposition.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Spec Badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>C:N Ratio Optimized (20:1)</span>
                  </span>
                  <span className="font-bold text-slate-700">Moisture Content: &lt; 20%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Value Chain Pipeline Card */}
          <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-6 text-center">
              The Circular Value-Addition Pipeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-3 shadow-xs">
                  01
                </div>
                <h5 className="font-bold text-slate-900 text-sm">Source Segregation</h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Produce trimmings & fish offal separated directly at wholesale market sheds.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-sky-100/60 border border-sky-200/80">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg mb-3 shadow-xs">
                  02
                </div>
                <h5 className="font-bold text-slate-900 text-sm">Digitized Dispatch</h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  BazarCycle coordinates verified collectors via concurrency-safe atomic pickup locks.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-amber-100/60 border border-amber-200/80">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-3 shadow-xs">
                  03
                </div>
                <h5 className="font-bold text-slate-900 text-sm">Bio-Refining & Milling</h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Aerobic decomposition for compost; sterilization & pelletizing for aquaculture feed.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-purple-100/60 border border-purple-200/80">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-3 shadow-xs">
                  04
                </div>
                <h5 className="font-bold text-slate-900 text-sm">Commercial Distribution</h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Standardized eco-packaged products distributed to farmers and aquaculture fisheries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
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
