import React from 'react';
import { 
  ClipboardCheck, 
  Cpu, 
  Truck, 
  Recycle, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Register Waste Batch',
      actor: 'Market Manager',
      desc: 'The market manager enters the estimated quantity (KG) and category (e.g., Vegetable Waste, Fruit Waste, Plastic, Fish Waste) arriving at market accumulation points.',
      highlight: 'Validated for positive quantity > 0 KG.'
    },
    {
      step: '02',
      title: 'Rule-Based Recommendation',
      actor: 'Deterministic Engine',
      desc: 'The backend evaluates deterministic categorization rules to recommend the optimal transformation pathway (Composting, Recycling, Organic Fertilizer) with an explainable rationale.',
      highlight: 'Zero AI hallucinations or external API fees.'
    },
    {
      step: '03',
      title: 'Calculate Estimated Resource Value',
      actor: 'Valuation Formula',
      desc: 'Estimated Resource Value = Quantity (KG) × Estimated Value per KG (BDT). Provides clear economic incentive for market segregation.',
      highlight: 'Project estimates clearly labelled.'
    },
    {
      step: '04',
      title: 'Request Pickup & Match Collector',
      actor: 'Pickup Workflow',
      desc: 'Market Manager requests collection. The batch appears on the live "Available Pickups" board. A registered collector reviews quantity, location, and accepts the job.',
      highlight: 'Strict concurrency lock: two collectors cannot accept the same pickup.'
    },
    {
      step: '05',
      title: 'Collect & Verify Recovery',
      actor: 'Collector / Facility',
      desc: 'Collector loads the batch and marks it as "COLLECTED". The system transitions waste status and automatically creates an immutable Impact Record.',
      highlight: 'Diverted from mixed open dump.'
    },
    {
      step: '06',
      title: 'Measure Impact & Score Market',
      actor: 'Analytics Engine',
      desc: 'Live dashboards update recovered tonnage, estimated resource value, avoided CO₂ emissions, and computes the 4-component Bazar Sustainability Score (0–100).',
      highlight: 'Real-time database analytics.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Workflow & Technology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BazarCycle BD Works
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            A transparent, audit-ready operational cycle connecting Dhaka's markets, collection logistics, and resource recovery plants.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-emerald-600 tracking-tight">{item.step}</span>
                  <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {item.actor}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-medium text-emerald-700 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{item.highlight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Deterministic Rule Engine Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Audit-Ready Logic</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Deterministic Categorization Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              No black-box machine learning. Each category follows defined Bangladesh environmental benchmarks.
            </p>
            <span className="text-[10px] text-slate-400 font-medium sm:hidden block mt-1">
              Scroll horizontally to view all attributes &rarr;
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider">Waste Category</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider">Recommended Pathway</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider">Estimated Rate (BDT/KG)</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider">CO₂ Impact Factor</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider">Explainable Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3 font-semibold text-emerald-900">Vegetable Waste</td>
                  <td className="px-4 py-3 font-medium text-emerald-700">Composting</td>
                  <td className="px-4 py-3 font-bold">15.00 BDT</td>
                  <td className="px-4 py-3">0.45 kg CO₂e / kg</td>
                  <td className="px-4 py-3">Rich in nitrogen and moisture for decentralized organic compost pits.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-amber-900">Fruit Waste</td>
                  <td className="px-4 py-3 font-medium text-amber-700">Composting</td>
                  <td className="px-4 py-3 font-bold">12.00 BDT</td>
                  <td className="px-4 py-3">0.40 kg CO₂e / kg</td>
                  <td className="px-4 py-3">High-sugar biomass accelerates bio-compost maturation and bio-fertilizer.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-rose-900">Fish Waste</td>
                  <td className="px-4 py-3 font-medium text-rose-700">Organic/Fertilizer Pathway</td>
                  <td className="px-4 py-3 font-bold">25.00 BDT</td>
                  <td className="px-4 py-3">0.60 kg CO₂e / kg</td>
                  <td className="px-4 py-3">Offal and scales processed into organic fish-meal agricultural feed.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-sky-900">Plastic</td>
                  <td className="px-4 py-3 font-medium text-sky-700">Recycling</td>
                  <td className="px-4 py-3 font-bold">35.00 BDT</td>
                  <td className="px-4 py-3">1.20 kg CO₂e / kg</td>
                  <td className="px-4 py-3">Rigid PET and HDPE crates granulated and pelletized for circular reuse.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-purple-900">Paper/Cardboard</td>
                  <td className="px-4 py-3 font-medium text-purple-700">Paper Recycling</td>
                  <td className="px-4 py-3 font-bold">18.00 BDT</td>
                  <td className="px-4 py-3">0.90 kg CO₂e / kg</td>
                  <td className="px-4 py-3">Dry corrugated cartons baled and pulped at paper recycling mills.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-700">Other</td>
                  <td className="px-4 py-3 font-medium text-slate-600">Responsible Disposal</td>
                  <td className="px-4 py-3 font-bold">5.00 BDT</td>
                  <td className="px-4 py-3">0.10 kg CO₂e / kg</td>
                  <td className="px-4 py-3">Secondary sorting before sanitary municipal collection.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sustainability Score Formula Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-forest-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Scoring Methodology
            </span>
            <h2 className="text-2xl font-bold mt-1 text-white">
              Bazar Sustainability Score (0–100)
            </h2>
            <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
              Every market receives a transparent score calculated directly from its actual recorded batches, recovery rate, and collection fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-emerald-700/60">
            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-600/40">
              <span className="text-xs font-bold text-emerald-300">Segregation</span>
              <p className="text-2xl font-black text-white mt-1">25%</p>
              <span className="text-[11px] text-emerald-200">Ratio of categorized vs unsorted waste</span>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-600/40">
              <span className="text-xs font-bold text-emerald-300">Recovery</span>
              <p className="text-2xl font-black text-white mt-1">30%</p>
              <span className="text-[11px] text-emerald-200">Ratio of collected vs total waste</span>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-600/40">
              <span className="text-xs font-bold text-emerald-300">Recycling</span>
              <p className="text-2xl font-black text-white mt-1">20%</p>
              <span className="text-[11px] text-emerald-200">Diverted to recycling & composting</span>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-600/40">
              <span className="text-xs font-bold text-emerald-300">Collection Efficiency</span>
              <p className="text-2xl font-black text-white mt-1">25%</p>
              <span className="text-[11px] text-emerald-200">Fulfillment of requested pickups</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
