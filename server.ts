import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'bazarcycle_secret_key_2026_bd';
const PORT = Number(process.env.PORT) || 3000;

// ==========================================
// In-Memory Data Models & Seed Data
// ==========================================

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'MARKET_MANAGER' | 'COLLECTOR';
  hashed_password: string;
  created_at: string;
  updated_at: string;
}

interface Market {
  id: string;
  name: string;
  location: string;
  area: string;
  manager_id?: string | null;
  contact_phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

interface WasteCategory {
  id: string;
  name: string;
  description?: string | null;
  waste_type: string;
  resource_pathway: string;
  estimated_value_per_kg: number;
  recyclable: boolean;
  organic: boolean;
  created_at: string;
}

interface WasteRecord {
  id: string;
  market_id: string;
  category_id: string;
  quantity_kg: number;
  description?: string | null;
  record_date: string;
  status: 'AVAILABLE' | 'ACCEPTED' | 'COLLECTED' | 'CANCELLED';
  recommended_pathway: string;
  estimated_value: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

interface PickupRequest {
  id: string;
  waste_record_id: string;
  market_id: string;
  collector_id?: string | null;
  status: 'AVAILABLE' | 'ACCEPTED' | 'COLLECTED' | 'CANCELLED';
  requested_at: string;
  accepted_at?: string | null;
  collected_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface ImpactRecord {
  id: string;
  market_id: string;
  waste_record_id: string;
  quantity_recovered_kg: number;
  quantity_recycled_kg: number;
  quantity_composted_kg: number;
  estimated_value: number;
  co2_impact_estimate: number;
  recorded_at: string;
}

interface SustainabilityScore {
  id: string;
  market_id: string;
  segregation_score: number;
  recovery_score: number;
  recycling_score: number;
  collection_score: number;
  total_score: number;
  score_label: string;
  calculated_at: string;
}

// Global in-memory storage tables
const profiles: Profile[] = [];
const markets: Market[] = [];
const wasteCategories: WasteCategory[] = [];
const wasteRecords: WasteRecord[] = [];
const pickupRequests: PickupRequest[] = [];
const impactRecords: ImpactRecord[] = [];
const sustainabilityScores: SustainabilityScore[] = [];

// ==========================================
// Recommendation Rules Catalog
// ==========================================
const RECOMMENDATION_RULES: Record<string, {
  standard_name: string;
  recommended_pathway: string;
  default_rate_bdt: number;
  explanation: string;
  organic: boolean;
  recyclable: boolean;
  co2_factor_kg_per_kg: number;
}> = {
  'vegetable waste': {
    standard_name: 'Vegetable Waste',
    recommended_pathway: 'Composting',
    default_rate_bdt: 15.0,
    explanation: 'Vegetable waste is rich in nitrogen and organic moisture; it can be directly redirected into decentralized aerobic composting or municipal compost pits instead of open dumps.',
    organic: true,
    recyclable: false,
    co2_factor_kg_per_kg: 0.45,
  },
  'fruit waste': {
    standard_name: 'Fruit Waste',
    recommended_pathway: 'Composting',
    default_rate_bdt: 12.0,
    explanation: 'High-sugar organic fruit discards decompose rapidly and accelerate bio-compost maturation and liquid bio-fertilizer production.',
    organic: true,
    recyclable: false,
    co2_factor_kg_per_kg: 0.40,
  },
  'fish waste': {
    standard_name: 'Fish Waste',
    recommended_pathway: 'Organic/Fertilizer Pathway',
    default_rate_bdt: 25.0,
    explanation: 'High-protein fish market trimmings and offal provide premium raw nitrogen and phosphorus ingredients for specialized fish-meal and organic agricultural fertilizer plants.',
    organic: true,
    recyclable: false,
    co2_factor_kg_per_kg: 0.60,
  },
  plastic: {
    standard_name: 'Plastic',
    recommended_pathway: 'Recycling',
    default_rate_bdt: 35.0,
    explanation: 'Rigid packaging, PET bottles, and plastic crates can be cleaned, shredded, and sold to local plastic recycling aggregators for pelletization.',
    organic: false,
    recyclable: true,
    co2_factor_kg_per_kg: 1.20,
  },
  'paper/cardboard': {
    standard_name: 'Paper/Cardboard',
    recommended_pathway: 'Paper Recycling',
    default_rate_bdt: 18.0,
    explanation: 'Dry corrugated boxes, produce cartons, and wrapping papers are baled and routed to local paper and cardboard pulp reprocessing mills.',
    organic: false,
    recyclable: true,
    co2_factor_kg_per_kg: 0.90,
  },
  other: {
    standard_name: 'Other',
    recommended_pathway: 'Responsible Disposal',
    default_rate_bdt: 5.0,
    explanation: 'Mixed or unclassified market waste should undergo secondary manual segregation at a collection point to divert any salvageable recyclables before authorized municipal sanitary disposal.',
    organic: false,
    recyclable: false,
    co2_factor_kg_per_kg: 0.10,
  },
};

function normalizeCategoryName(name: string): string {
  if (!name) return 'other';
  const c = name.trim().toLowerCase();
  if (c.includes('veg')) return 'vegetable waste';
  if (c.includes('fruit')) return 'fruit waste';
  if (c.includes('fish')) return 'fish waste';
  if (c.includes('plastic')) return 'plastic';
  if (c.includes('paper') || c.includes('cardboard')) return 'paper/cardboard';
  return 'other';
}

function getRecommendation(categoryName: string, quantityKg: number, customRateBdt?: number) {
  if (quantityKg <= 0) {
    throw new Error('Waste quantity must be strictly greater than 0 KG.');
  }
  const key = normalizeCategoryName(categoryName);
  const rule = RECOMMENDATION_RULES[key] || RECOMMENDATION_RULES['other'];
  const rate = customRateBdt != null && customRateBdt >= 0 ? customRateBdt : rule.default_rate_bdt;
  const estimatedValue = Math.round(quantityKg * rate * 100) / 100;
  const co2Estimate = Math.round(quantityKg * rule.co2_factor_kg_per_kg * 100) / 100;

  return {
    category: rule.standard_name,
    recommended_pathway: rule.recommended_pathway,
    quantity_kg: quantityKg,
    unit_rate_bdt: rate,
    estimated_value: estimatedValue,
    explanation: rule.explanation,
    co2_impact_estimate: co2Estimate,
    organic: rule.organic,
    recyclable: rule.recyclable,
    disclaimer: 'Values are project estimates for demonstration purposes and may vary by location, quality, and market conditions.',
  };
}

function calculateMarketScore(marketId: string) {
  const marketWaste = wasteRecords.filter(w => w.market_id === marketId);
  const totalWasteKg = marketWaste.reduce((sum, w) => sum + w.quantity_kg, 0);

  if (totalWasteKg === 0) {
    return {
      market_id: marketId,
      segregation_score: 0,
      recovery_score: 0,
      recycling_score: 0,
      collection_score: 0,
      total_score: 0,
      score_label: 'Needs Improvement',
      weights: {
        segregation: '25%',
        recovery: '30%',
        recycling: '20%',
        collection: '25%',
      },
      disclaimer: 'Project-defined metric for demonstration; not an official environmental certification.',
    };
  }

  // Segregation: non-other
  const segregatedKg = marketWaste.reduce((sum, w) => {
    const cat = wasteCategories.find(c => c.id === w.category_id);
    return cat && cat.name.toLowerCase() !== 'other' ? sum + w.quantity_kg : sum;
  }, 0);
  const segregationScore = Math.round((segregatedKg / totalWasteKg) * 10000) / 100;

  // Recovery: collected waste
  const recoveredKg = marketWaste.reduce((sum, w) => {
    return w.status === 'COLLECTED' ? sum + w.quantity_kg : sum;
  }, 0);
  const recoveryScore = Math.round((recoveredKg / totalWasteKg) * 10000) / 100;

  // Recycling & Composting
  const recycledOrCompostedKg = marketWaste.reduce((sum, w) => {
    if (w.status !== 'COLLECTED') return sum;
    const cat = wasteCategories.find(c => c.id === w.category_id);
    return cat && (cat.recyclable || cat.organic) ? sum + w.quantity_kg : sum;
  }, 0);
  const recyclingScore = Math.round((recycledOrCompostedKg / totalWasteKg) * 10000) / 100;

  // Collection efficiency
  const pickups = pickupRequests.filter(p => p.market_id === marketId);
  const totalPickups = pickups.length;
  const collectedPickups = pickups.filter(p => p.status === 'COLLECTED').length;
  const collectionScore = totalPickups > 0 ? Math.round((collectedPickups / totalPickups) * 10000) / 100 : 0;

  const totalScore = Math.round(
    (segregationScore * 0.25 + recoveryScore * 0.30 + recyclingScore * 0.20 + collectionScore * 0.25) * 100
  ) / 100;

  let scoreLabel = 'Needs Improvement';
  if (totalScore >= 80) scoreLabel = 'Excellent';
  else if (totalScore >= 60) scoreLabel = 'Good';
  else if (totalScore >= 40) scoreLabel = 'Developing';

  return {
    market_id: marketId,
    segregation_score: segregationScore,
    recovery_score: recoveryScore,
    recycling_score: recyclingScore,
    collection_score: collectionScore,
    total_score: totalScore,
    score_label: scoreLabel,
    weights: {
      segregation: '25%',
      recovery: '30%',
      recycling: '20%',
      collection: '25%',
    },
    metrics_summary: {
      total_waste_kg: totalWasteKg,
      recovered_kg: recoveredKg,
      segregated_kg: segregatedKg,
      total_pickups: totalPickups,
      collected_pickups: collectedPickups,
    },
    disclaimer: 'Project-defined metric for demonstration; not an official environmental certification.',
  };
}

// ==========================================
// Populate Seed Data
// ==========================================
function seedDatabase() {
  // Pre-computed bcrypt hash for 'BazarCycle2026!' (cost factor 10)
  // Eliminates synchronous CPU-blocking bcrypt hashing during container boot on Render
  const defaultHash = '$2b$10$rYkycDBm/vKDkuDomHIiEum3h/g83.O7w5GSrFemHkU2nwoV/1G9O';

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const daysAgo = (d: number, h: number = 0) => new Date(now.getTime() - (d * 86400000) - (h * 3600000)).toISOString();

  // Users
  const admin: Profile = {
    id: 'user-admin-1',
    name: 'Rahim Ahmed (Admin)',
    email: 'admin@bazarcycle.bd',
    phone: '+8801711000001',
    role: 'ADMIN',
    hashed_password: defaultHash,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const manager1: Profile = {
    id: 'user-mgr-1',
    name: 'Tariqul Islam (Karwan Bazar Manager)',
    email: 'manager@bazarcycle.bd',
    phone: '+8801711000002',
    role: 'MARKET_MANAGER',
    hashed_password: defaultHash,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const manager2: Profile = {
    id: 'user-mgr-2',
    name: 'Nasreen Akhter (Jatrabari Manager)',
    email: 'manager2@bazarcycle.bd',
    phone: '+8801711000003',
    role: 'MARKET_MANAGER',
    hashed_password: defaultHash,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const collector1: Profile = {
    id: 'user-col-1',
    name: 'Salam Miah (Green Cycle Logistics)',
    email: 'collector@bazarcycle.bd',
    phone: '+8801711000004',
    role: 'COLLECTOR',
    hashed_password: defaultHash,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const collector2: Profile = {
    id: 'user-col-2',
    name: 'Faruk Hossain (Dhaka Bio-Recyclers)',
    email: 'collector2@bazarcycle.bd',
    phone: '+8801711000005',
    role: 'COLLECTOR',
    hashed_password: defaultHash,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  profiles.push(admin, manager1, manager2, collector1, collector2);

  // Categories
  const catList: WasteCategory[] = [
    {
      id: 'cat-veg-1',
      name: 'Vegetable Waste',
      description: 'Surplus greens, root discards, cabbage leaves, cauliflower stalks, and vegetable peelings from market stalls.',
      waste_type: 'Organic',
      resource_pathway: 'Composting',
      estimated_value_per_kg: 15.0,
      recyclable: false,
      organic: true,
      created_at: daysAgo(30),
    },
    {
      id: 'cat-fruit-1',
      name: 'Fruit Waste',
      description: 'Overripe, damaged, or unmarketable fruits (mango, banana, papaya, jackfruit scraps) suitable for bio-fermentation.',
      waste_type: 'Organic',
      resource_pathway: 'Composting',
      estimated_value_per_kg: 12.0,
      recyclable: false,
      organic: true,
      created_at: daysAgo(30),
    },
    {
      id: 'cat-fish-1',
      name: 'Fish Waste',
      description: 'Fish scales, entrails, fins, and heads from market fish-mongering stalls for specialized fish-meal and bio-organic fertilizer.',
      waste_type: 'Organic',
      resource_pathway: 'Organic/Fertilizer Pathway',
      estimated_value_per_kg: 25.0,
      recyclable: false,
      organic: true,
      created_at: daysAgo(30),
    },
    {
      id: 'cat-plastic-1',
      name: 'Plastic',
      description: 'Rigid packaging, PET beverage bottles, polythene wraps, and bulk HDPE vegetable crates.',
      waste_type: 'Recyclable',
      resource_pathway: 'Recycling',
      estimated_value_per_kg: 35.0,
      recyclable: true,
      organic: false,
      created_at: daysAgo(30),
    },
    {
      id: 'cat-paper-1',
      name: 'Paper/Cardboard',
      description: 'Corrugated produce transport cartons, paper liners, and clean packaging boards.',
      waste_type: 'Recyclable',
      resource_pathway: 'Paper Recycling',
      estimated_value_per_kg: 18.0,
      recyclable: true,
      organic: false,
      created_at: daysAgo(30),
    },
    {
      id: 'cat-other-1',
      name: 'Other',
      description: 'Mixed or unclassified market residuals requiring secondary sorting before authorized sanitary disposal.',
      waste_type: 'Mixed',
      resource_pathway: 'Responsible Disposal',
      estimated_value_per_kg: 5.0,
      recyclable: false,
      organic: false,
      created_at: daysAgo(30),
    },
  ];
  wasteCategories.push(...catList);

  // Markets
  const m1: Market = {
    id: 'market-karwan-1',
    name: 'Karwan Bazar Demo Market',
    location: 'Tejgaon, Dhaka 1215',
    area: 'Karwan Bazar / Central Dhaka',
    manager_id: manager1.id,
    contact_phone: '+8801711000002',
    status: 'ACTIVE',
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const m2: Market = {
    id: 'market-jatrabari-1',
    name: 'Jatrabari Krishi Bazar Demo Market',
    location: 'Jatrabari, Dhaka 1204',
    area: 'Jatrabari / South Dhaka',
    manager_id: manager2.id,
    contact_phone: '+8801711000003',
    status: 'ACTIVE',
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };

  const m3: Market = {
    id: 'market-mirpur-1',
    name: 'Mirpur 1 Municipal Bazar Demo Market',
    location: 'Mirpur 1, Dhaka 1216',
    area: 'Mirpur / North Dhaka',
    manager_id: null,
    contact_phone: '+8801711000099',
    status: 'ACTIVE',
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  };
  markets.push(m1, m2, m3);

  // Waste records
  const w1: WasteRecord = {
    id: 'waste-w1',
    market_id: m1.id,
    category_id: catList[0].id,
    quantity_kg: 280.0,
    description: 'Morning fresh vegetable trimmings and cabbage leaves from shed 4.',
    record_date: todayStr,
    status: 'COLLECTED',
    recommended_pathway: 'Composting',
    estimated_value: 4200.0,
    created_by: manager1.id,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  };

  const p1: PickupRequest = {
    id: 'pickup-p1',
    waste_record_id: w1.id,
    market_id: m1.id,
    collector_id: collector1.id,
    status: 'COLLECTED',
    requested_at: daysAgo(2),
    accepted_at: daysAgo(2, -1),
    collected_at: daysAgo(2, -3),
    notes: 'Collected via motorized van for Dhaka Composting Plant.',
    created_at: daysAgo(2),
    updated_at: daysAgo(2, -3),
  };

  const i1: ImpactRecord = {
    id: 'impact-i1',
    market_id: m1.id,
    waste_record_id: w1.id,
    quantity_recovered_kg: 280.0,
    quantity_recycled_kg: 0.0,
    quantity_composted_kg: 280.0,
    estimated_value: 4200.0,
    co2_impact_estimate: 126.0,
    recorded_at: daysAgo(2, -3),
  };

  const w2: WasteRecord = {
    id: 'waste-w2',
    market_id: m1.id,
    category_id: catList[3].id,
    quantity_kg: 65.0,
    description: 'Sorted HDPE vegetable crates and clear PET bottles from produce unloading dock.',
    record_date: todayStr,
    status: 'COLLECTED',
    recommended_pathway: 'Recycling',
    estimated_value: 2275.0,
    created_by: manager1.id,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  };

  const p2: PickupRequest = {
    id: 'pickup-p2',
    waste_record_id: w2.id,
    market_id: m1.id,
    collector_id: collector1.id,
    status: 'COLLECTED',
    requested_at: daysAgo(1),
    accepted_at: daysAgo(1, -1),
    collected_at: daysAgo(1, -2),
    notes: 'Plastic bails collected for mechanical shredding and washing.',
    created_at: daysAgo(1),
    updated_at: daysAgo(1, -2),
  };

  const i2: ImpactRecord = {
    id: 'impact-i2',
    market_id: m1.id,
    waste_record_id: w2.id,
    quantity_recovered_kg: 65.0,
    quantity_recycled_kg: 65.0,
    quantity_composted_kg: 0.0,
    estimated_value: 2275.0,
    co2_impact_estimate: 78.0,
    recorded_at: daysAgo(1, -2),
  };

  const w3: WasteRecord = {
    id: 'waste-w3',
    market_id: m1.id,
    category_id: catList[2].id,
    quantity_kg: 95.0,
    description: 'Afternoon fish market cleaning discards packed in insulated barrels.',
    record_date: todayStr,
    status: 'ACCEPTED',
    recommended_pathway: 'Organic/Fertilizer Pathway',
    estimated_value: 2375.0,
    created_by: manager1.id,
    created_at: daysAgo(0, 3),
    updated_at: daysAgo(0, 1),
  };

  const p3: PickupRequest = {
    id: 'pickup-p3',
    waste_record_id: w3.id,
    market_id: m1.id,
    collector_id: collector1.id,
    status: 'ACCEPTED',
    requested_at: daysAgo(0, 3),
    accepted_at: daysAgo(0, 1),
    collected_at: null,
    notes: 'En route to collection point at Gate 2.',
    created_at: daysAgo(0, 3),
    updated_at: daysAgo(0, 1),
  };

  const w4: WasteRecord = {
    id: 'waste-w4',
    market_id: m1.id,
    category_id: catList[4].id,
    quantity_kg: 120.0,
    description: 'Flattened fruit cartons and wholesale packaging boxes stacked at gate 3.',
    record_date: todayStr,
    status: 'AVAILABLE',
    recommended_pathway: 'Paper Recycling',
    estimated_value: 2160.0,
    created_by: manager1.id,
    created_at: daysAgo(0, 1),
    updated_at: daysAgo(0, 1),
  };

  const p4: PickupRequest = {
    id: 'pickup-p4',
    waste_record_id: w4.id,
    market_id: m1.id,
    collector_id: null,
    status: 'AVAILABLE',
    requested_at: daysAgo(0, 1),
    accepted_at: null,
    collected_at: null,
    notes: 'Dry bundled boxes ready for direct van loading.',
    created_at: daysAgo(0, 1),
    updated_at: daysAgo(0, 1),
  };

  const w5: WasteRecord = {
    id: 'waste-w5',
    market_id: m2.id,
    category_id: catList[1].id,
    quantity_kg: 190.0,
    description: 'Summer seasonal fruit waste (papaya and melon skins).',
    record_date: todayStr,
    status: 'COLLECTED',
    recommended_pathway: 'Composting',
    estimated_value: 2280.0,
    created_by: manager2.id,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  };

  const p5: PickupRequest = {
    id: 'pickup-p5',
    waste_record_id: w5.id,
    market_id: m2.id,
    collector_id: collector2.id,
    status: 'COLLECTED',
    requested_at: daysAgo(1),
    accepted_at: daysAgo(1, -1),
    collected_at: daysAgo(1, -3),
    notes: 'Transferred to Jatrabari community vermi-compost plant.',
    created_at: daysAgo(1),
    updated_at: daysAgo(1, -3),
  };

  const i5: ImpactRecord = {
    id: 'impact-i5',
    market_id: m2.id,
    waste_record_id: w5.id,
    quantity_recovered_kg: 190.0,
    quantity_recycled_kg: 0.0,
    quantity_composted_kg: 190.0,
    estimated_value: 2280.0,
    co2_impact_estimate: 76.0,
    recorded_at: daysAgo(1, -3),
  };

  wasteRecords.push(w1, w2, w3, w4, w5);
  pickupRequests.push(p1, p2, p3, p4, p5);
  impactRecords.push(i1, i2, i5);
}

seedDatabase();

// ==========================================
// PostgreSQL (Supabase) Integration & Error Handler
// ==========================================
let pool: pg.Pool | null = null;
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    console.log('PostgreSQL database pool configured for Supabase.');
  } catch (err: any) {
    console.warn('PostgreSQL pool initialization failed:', err.message);
    pool = null;
  }
}

function handleDbError(err: any, res: express.Response, fallbackMessage: string) {
  console.error('[Database Error]', err);
  if (err.code === '23505') {
    // Unique constraint violation (e.g., profiles_email_key)
    return res.status(409).json({
      error: 'A record with this unique value (e.g. email) already exists.',
      detail: err.detail || 'Duplicate key violation.',
    });
  }
  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      error: 'Referenced entity does not exist in database.',
      detail: err.detail || 'Foreign key violation.',
    });
  }
  if (err.code === '23514') {
    // Check constraint violation (e.g. role IN ('ADMIN', 'MARKET_MANAGER', 'COLLECTOR'))
    return res.status(400).json({
      error: 'Value violates database check constraints. Please check roles or quantities.',
      detail: err.message,
    });
  }
  return res.status(500).json({
    error: fallbackMessage,
    detail: err.message || fallbackMessage,
  });
}

async function tryDbQuery(sql: string, params: any[] = []): Promise<any> {
  if (!pool) return null;
  try {
    return await pool.query(sql, params);
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('connect') || err.message?.includes('timeout')) {
      console.warn('[DB Connection Warning] Database temporarily unreachable, fallback to memory:', err.message);
      return null;
    }
    throw err;
  }
}

async function initDbSync() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log('Synchronizing with Supabase PostgreSQL...');

    // Categories
    const catRes = await client.query('SELECT * FROM waste_categories');
    if (catRes.rows.length > 0) {
      wasteCategories.length = 0;
      catRes.rows.forEach(r => wasteCategories.push({
        id: r.id,
        name: r.name,
        description: r.description,
        waste_type: r.waste_type,
        resource_pathway: r.resource_pathway,
        estimated_value_per_kg: Number(r.estimated_value_per_kg),
        recyclable: Boolean(r.recyclable),
        organic: Boolean(r.organic),
        created_at: r.created_at?.toISOString?.() || String(r.created_at),
      }));
    } else {
      for (const c of wasteCategories) {
        await client.query(
          `INSERT INTO waste_categories (id, name, description, waste_type, resource_pathway, estimated_value_per_kg, recyclable, organic, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.description, c.waste_type, c.resource_pathway, c.estimated_value_per_kg, c.recyclable, c.organic, c.created_at]
        );
      }
    }

    // Profiles
    const profRes = await client.query('SELECT * FROM profiles');
    if (profRes.rows.length > 0) {
      profiles.length = 0;
      profRes.rows.forEach(r => profiles.push({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        hashed_password: r.hashed_password,
        created_at: r.created_at?.toISOString?.() || String(r.created_at),
        updated_at: r.updated_at?.toISOString?.() || String(r.updated_at),
      }));
    } else {
      for (const p of profiles) {
        await client.query(
          `INSERT INTO profiles (id, name, email, phone, role, hashed_password, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.email, p.phone, p.role, p.hashed_password, p.created_at, p.updated_at]
        );
      }
    }

    // Markets
    const mRes = await client.query('SELECT * FROM markets');
    if (mRes.rows.length > 0) {
      markets.length = 0;
      mRes.rows.forEach(r => markets.push({
        id: r.id,
        name: r.name,
        location: r.location,
        area: r.area,
        manager_id: r.manager_id,
        contact_phone: r.contact_phone,
        status: r.status,
        created_at: r.created_at?.toISOString?.() || String(r.created_at),
        updated_at: r.updated_at?.toISOString?.() || String(r.updated_at),
      }));
    } else {
      for (const m of markets) {
        await client.query(
          `INSERT INTO markets (id, name, location, area, manager_id, contact_phone, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [m.id, m.name, m.location, m.area, m.manager_id, m.contact_phone, m.status, m.created_at, m.updated_at]
        );
      }
    }

    // Waste records
    const wRes = await client.query('SELECT * FROM waste_records');
    if (wRes.rows.length > 0) {
      wasteRecords.length = 0;
      wRes.rows.forEach(r => wasteRecords.push({
        id: r.id,
        market_id: r.market_id,
        category_id: r.category_id,
        quantity_kg: Number(r.quantity_kg),
        description: r.description,
        record_date: r.record_date?.toISOString?.().split('T')[0] || String(r.record_date),
        status: r.status,
        recommended_pathway: r.recommended_pathway,
        estimated_value: Number(r.estimated_value),
        created_by: r.created_by,
        created_at: r.created_at?.toISOString?.() || String(r.created_at),
        updated_at: r.updated_at?.toISOString?.() || String(r.updated_at),
      }));
    }

    // Pickup requests
    const pRes = await client.query('SELECT * FROM pickup_requests');
    if (pRes.rows.length > 0) {
      pickupRequests.length = 0;
      pRes.rows.forEach(r => pickupRequests.push({
        id: r.id,
        waste_record_id: r.waste_record_id,
        market_id: r.market_id,
        collector_id: r.collector_id,
        status: r.status,
        requested_at: r.requested_at?.toISOString?.() || String(r.requested_at),
        accepted_at: r.accepted_at?.toISOString?.() || r.accepted_at,
        collected_at: r.collected_at?.toISOString?.() || r.collected_at,
        notes: r.notes,
        created_at: r.created_at?.toISOString?.() || String(r.created_at),
        updated_at: r.updated_at?.toISOString?.() || String(r.updated_at),
      }));
    }

    client.release();
    console.log('Supabase sync complete.');
  } catch (err: any) {
    console.warn('Supabase sync notice (using memory store):', err.message);
  }
}

// ==========================================
// Express App & Middleware
// ==========================================
const app = express();

// ==========================================
// 1. Ultra-Lightweight Health Endpoint
// Defined FIRST before any middleware or authentication.
// Responds in <1ms without touching database or running auth logic.
// Used by Render health-check, external uptime monitors, and frontend wake detector.
// ==========================================
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BazarCycle BD API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Enable Gzip/Brotli compression for all HTTP responses and static bundles
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth token helpers
function createToken(profile: Profile): string {
  return jwt.sign({ sub: profile.id, role: profile.role, email: profile.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (req as any).user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = profiles.find(p => p.id === payload.sub);
    (req as any).user = user || null;
  } catch (err) {
    (req as any).user = null;
  }
  next();
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as Profile | null;
  if (!user) {
    return res.status(401).json({
      error: 'Not authenticated. Please log in.',
      detail: 'Not authenticated. Please log in.',
    });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user as Profile | null;
    if (!user) {
      return res.status(401).json({
        error: 'Not authenticated. Please log in.',
        detail: 'Not authenticated. Please log in.',
      });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: `Insufficient permissions. Allowed roles: ${roles.join(', ')}`,
        detail: `Insufficient permissions. Allowed roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
}

app.use(authMiddleware);

// ==========================================
// API Router
// ==========================================
const apiRouter = express.Router();

function formatUser(u: Profile) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || null,
    role: u.role,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

// ------------------------------------------
// 1. Authentication Routes (Audited & Robust)
// ------------------------------------------
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.', detail: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.', detail: 'Email is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.',
        detail: 'Password must be at least 6 characters.',
      });
    }

    const normEmail = email.trim().toLowerCase();

    // Check duplicate in memory
    if (profiles.some(p => p.email.toLowerCase() === normEmail)) {
      return res.status(400).json({
        error: 'A user with this email address already exists.',
        detail: 'A user with this email address already exists.',
      });
    }

    // Check duplicate in Supabase DB if active
    const dbCheck = await tryDbQuery('SELECT id FROM profiles WHERE LOWER(email) = $1', [normEmail]);
    if (dbCheck && dbCheck.rows && dbCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'A user with this email address already exists in database.',
        detail: 'A user with this email address already exists in database.',
      });
    }

    // Strictly validate Enum constraint: CHECK (role IN ('ADMIN', 'MARKET_MANAGER', 'COLLECTOR'))
    const VALID_ROLES = ['ADMIN', 'MARKET_MANAGER', 'COLLECTOR'] as const;
    const normalizedRole = String(role || 'MARKET_MANAGER').trim().toUpperCase() as 'ADMIN' | 'MARKET_MANAGER' | 'COLLECTOR';
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: "Invalid role. Role must strictly be 'ADMIN', 'MARKET_MANAGER', or 'COLLECTOR'.",
        detail: "Invalid role. Role must strictly be 'ADMIN', 'MARKET_MANAGER', or 'COLLECTOR'.",
      });
    }

    // Async bcrypt hash (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const newUser: Profile = {
      id: newId,
      name: name.trim(),
      email: normEmail,
      phone: phone ? String(phone).trim() : null,
      role: normalizedRole,
      hashed_password: hashedPassword,
      created_at: now,
      updated_at: now,
    };

    // Insert into Supabase if DB active
    await tryDbQuery(
      `INSERT INTO profiles (id, name, email, phone, role, hashed_password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [newUser.id, newUser.name, newUser.email, newUser.phone, newUser.role, newUser.hashed_password, newUser.created_at, newUser.updated_at]
    );

    profiles.push(newUser);

    const token = createToken(newUser);
    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: formatUser(newUser),
    });
  } catch (err: any) {
    return handleDbError(err, res, 'Failed to register user.');
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'Both email and password are required.',
        detail: 'Both email and password are required.',
      });
    }

    const normEmail = String(email).trim().toLowerCase();

    // Check memory first
    let user = profiles.find(p => p.email.toLowerCase() === normEmail);

    // If not found in memory, query Supabase DB
    if (!user) {
      const dbRes = await tryDbQuery('SELECT * FROM profiles WHERE LOWER(email) = $1', [normEmail]);
      if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
        const row = dbRes.rows[0];
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          role: row.role,
          hashed_password: row.hashed_password,
          created_at: row.created_at?.toISOString?.() || String(row.created_at),
          updated_at: row.updated_at?.toISOString?.() || String(row.updated_at),
        };
        profiles.push(user);
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Incorrect email or password.',
        detail: 'Incorrect email or password.',
      });
    }

    // Async bcrypt comparison
    const isMatch = await bcrypt.compare(String(password), user.hashed_password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect email or password.',
        detail: 'Incorrect email or password.',
      });
    }

    const token = createToken(user);
    return res.json({
      access_token: token,
      token_type: 'bearer',
      user: formatUser(user),
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      error: 'An unexpected authentication error occurred.',
      detail: err.message,
    });
  }
});

apiRouter.get('/auth/me', requireAuth, (req, res) => {
  res.json(formatUser((req as any).user));
});

apiRouter.get('/auth/users', requireRole(['ADMIN']), (req, res) => {
  try {
    const role = req.query.role as string | undefined;
    let list = profiles;
    if (role) {
      list = list.filter(p => p.role === role.trim().toUpperCase());
    }
    res.json(list.map(formatUser));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', detail: err.message });
  }
});

apiRouter.put('/auth/users/:id/role', requireRole(['ADMIN']), async (req, res) => {
  try {
    const newRole = ((req.query.new_role || req.body.new_role || '') as string).trim().toUpperCase();
    const VALID_ROLES = ['ADMIN', 'MARKET_MANAGER', 'COLLECTOR'];
    if (!VALID_ROLES.includes(newRole)) {
      return res.status(400).json({
        error: "Invalid role specified. Must be 'ADMIN', 'MARKET_MANAGER', or 'COLLECTOR'.",
        detail: "Invalid role specified.",
      });
    }

    const user = profiles.find(p => p.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.', detail: 'User not found.' });
    }

    const now = new Date().toISOString();
    user.role = newRole as any;
    user.updated_at = now;

    if (pool) {
      await pool.query('UPDATE profiles SET role = $1, updated_at = $2 WHERE id = $3', [newRole, now, user.id]);
    }

    res.json(formatUser(user));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to update user role.');
  }
});

// ------------------------------------------
// 2. Markets Routes
// ------------------------------------------
function formatMarket(m: Market) {
  const mgr = m.manager_id ? profiles.find(p => p.id === m.manager_id) : null;
  return {
    id: m.id,
    name: m.name,
    location: m.location,
    area: m.area,
    manager_id: m.manager_id || null,
    manager_name: mgr ? mgr.name : null,
    contact_phone: m.contact_phone || null,
    status: m.status,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
}

apiRouter.get('/markets', (req, res) => {
  try {
    const { area, status_filter } = req.query;
    let list = markets;
    if (status_filter) {
      list = list.filter(m => m.status === (status_filter as string).toUpperCase());
    }
    if (area) {
      list = list.filter(m => m.area.toLowerCase().includes((area as string).toLowerCase()));
    }
    res.json(list.map(formatMarket));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list markets', detail: err.message });
  }
});

apiRouter.get('/markets/my/market', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as Profile;
    let market = markets.find(m => m.manager_id === user.id);
    if (!market && user.role === 'ADMIN') {
      market = markets[0];
    }
    if (!market) {
      return res.json(null);
    }
    res.json(formatMarket(market));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch market', detail: err.message });
  }
});

apiRouter.get('/markets/:id', (req, res) => {
  try {
    const m = markets.find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Market not found.', detail: 'Market not found.' });
    res.json(formatMarket(m));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get market', detail: err.message });
  }
});

apiRouter.post('/markets', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, location, area, manager_id, contact_phone, status } = req.body;
    if (!name || !location || !area) {
      return res.status(400).json({
        error: 'Name, location, and area are required fields.',
        detail: 'Missing required market fields.',
      });
    }

    const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];
    const normStatus = (status || 'ACTIVE').trim().toUpperCase();
    if (!VALID_STATUSES.includes(normStatus)) {
      return res.status(400).json({
        error: "Status must strictly be 'ACTIVE' or 'INACTIVE'.",
        detail: 'Invalid status check constraint.',
      });
    }

    const now = new Date().toISOString();
    const newM: Market = {
      id: crypto.randomUUID(),
      name: name.trim(),
      location: location.trim(),
      area: area.trim(),
      manager_id: manager_id || null,
      contact_phone: contact_phone ? contact_phone.trim() : null,
      status: normStatus as any,
      created_at: now,
      updated_at: now,
    };

    if (pool) {
      await pool.query(
        `INSERT INTO markets (id, name, location, area, manager_id, contact_phone, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newM.id, newM.name, newM.location, newM.area, newM.manager_id, newM.contact_phone, newM.status, newM.created_at, newM.updated_at]
      );
    }

    markets.push(newM);
    res.status(201).json(formatMarket(newM));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to create market.');
  }
});

apiRouter.put('/markets/:id', requireAuth, async (req, res) => {
  try {
    const m = markets.find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Market not found.', detail: 'Market not found.' });

    const user = (req as any).user as Profile;
    if (user.role !== 'ADMIN' && m.manager_id !== user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this market.', detail: 'Forbidden.' });
    }

    const { name, location, area, contact_phone, status, manager_id } = req.body;
    if (name != null) m.name = name.trim();
    if (location != null) m.location = location.trim();
    if (area != null) m.area = area.trim();
    if (contact_phone != null) m.contact_phone = contact_phone.trim();
    if (status != null) {
      const s = status.toUpperCase();
      if (['ACTIVE', 'INACTIVE'].includes(s)) m.status = s;
    }
    if (user.role === 'ADMIN' && manager_id !== undefined) m.manager_id = manager_id;
    m.updated_at = new Date().toISOString();

    if (pool) {
      await pool.query(
        `UPDATE markets SET name = $1, location = $2, area = $3, contact_phone = $4, status = $5, manager_id = $6, updated_at = $7 WHERE id = $8`,
        [m.name, m.location, m.area, m.contact_phone, m.status, m.manager_id, m.updated_at, m.id]
      );
    }

    res.json(formatMarket(m));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to update market.');
  }
});

// ------------------------------------------
// 3. Waste Management & Categories
// ------------------------------------------
apiRouter.get('/waste/categories', (req, res) => {
  res.json(wasteCategories);
});

apiRouter.post('/waste/categories', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, waste_type, resource_pathway, estimated_value_per_kg, recyclable, organic } = req.body;
    if (!name || !waste_type || !resource_pathway) {
      return res.status(400).json({ error: 'Missing required category fields.', detail: 'Name, waste_type, and resource_pathway required.' });
    }

    const now = new Date().toISOString();
    const newCat: WasteCategory = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description ? description.trim() : null,
      waste_type: waste_type.trim(),
      resource_pathway: resource_pathway.trim(),
      estimated_value_per_kg: Number(estimated_value_per_kg) || 0,
      recyclable: Boolean(recyclable),
      organic: Boolean(organic),
      created_at: now,
    };

    if (pool) {
      await pool.query(
        `INSERT INTO waste_categories (id, name, description, waste_type, resource_pathway, estimated_value_per_kg, recyclable, organic, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newCat.id, newCat.name, newCat.description, newCat.waste_type, newCat.resource_pathway, newCat.estimated_value_per_kg, newCat.recyclable, newCat.organic, newCat.created_at]
      );
    }

    wasteCategories.push(newCat);
    res.status(201).json(newCat);
  } catch (err: any) {
    handleDbError(err, res, 'Failed to create waste category.');
  }
});

apiRouter.post('/waste/recommend', (req, res) => {
  try {
    const { category_id, category_name, quantity_kg } = req.body;
    let catName = category_name;
    let unitRate: number | undefined;

    if (category_id) {
      const cat = wasteCategories.find(c => c.id === category_id);
      if (cat) {
        catName = cat.name;
        unitRate = cat.estimated_value_per_kg;
      }
    }

    if (!catName) {
      return res.status(400).json({
        error: 'Either category_id or category_name must be provided.',
        detail: 'Missing category parameter.',
      });
    }

    const rec = getRecommendation(catName, Number(quantity_kg), unitRate);
    res.json(rec);
  } catch (err: any) {
    res.status(400).json({ error: err.message, detail: err.message });
  }
});

function formatWasteRecord(w: WasteRecord) {
  const m = markets.find(x => x.id === w.market_id);
  const cat = wasteCategories.find(x => x.id === w.category_id);
  const creator = w.created_by ? profiles.find(p => p.id === w.created_by) : null;
  const pickup = pickupRequests.find(p => p.waste_record_id === w.id);

  return {
    id: w.id,
    market_id: w.market_id,
    market_name: m ? m.name : null,
    category_id: w.category_id,
    category_name: cat ? cat.name : null,
    quantity_kg: w.quantity_kg,
    description: w.description || null,
    record_date: w.record_date,
    status: w.status,
    recommended_pathway: w.recommended_pathway,
    estimated_value: w.estimated_value,
    created_by: w.created_by || null,
    creator_name: creator ? creator.name : null,
    created_at: w.created_at,
    updated_at: w.updated_at,
    has_pickup_request: Boolean(pickup),
    pickup_status: pickup ? pickup.status : null,
  };
}

apiRouter.get('/waste', (req, res) => {
  try {
    const { market_id, category_id, status_filter, limit } = req.query;
    let list = wasteRecords;
    if (market_id) list = list.filter(w => w.market_id === market_id);
    if (category_id) list = list.filter(w => w.category_id === category_id);
    if (status_filter) list = list.filter(w => w.status === (status_filter as string).toUpperCase());

    const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const capped = limit ? sorted.slice(0, Number(limit)) : sorted;
    res.json(capped.map(formatWasteRecord));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve waste records', detail: err.message });
  }
});

apiRouter.get('/waste/:id', (req, res) => {
  try {
    const w = wasteRecords.find(x => x.id === req.params.id);
    if (!w) return res.status(404).json({ error: 'Waste record not found.', detail: 'Waste record not found.' });
    res.json(formatWasteRecord(w));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve waste record', detail: err.message });
  }
});

apiRouter.post('/waste', requireRole(['ADMIN', 'MARKET_MANAGER']), async (req, res) => {
  try {
    const user = (req as any).user as Profile;
    const { market_id, category_id, quantity_kg, description, record_date } = req.body;

    const market = markets.find(m => m.id === market_id);
    if (!market) {
      return res.status(404).json({ error: 'Specified market does not exist.', detail: 'Market not found.' });
    }
    if (user.role !== 'ADMIN' && market.manager_id !== user.id) {
      return res.status(403).json({
        error: 'You can only register waste for your assigned market.',
        detail: 'Unauthorized market assignment.',
      });
    }

    const cat = wasteCategories.find(c => c.id === category_id);
    if (!cat) {
      return res.status(404).json({ error: 'Specified waste category does not exist.', detail: 'Category not found.' });
    }

    const qty = Number(quantity_kg);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        error: 'Waste quantity must be strictly greater than 0 KG.',
        detail: 'Invalid quantity.',
      });
    }

    const rec = getRecommendation(cat.name, qty, cat.estimated_value_per_kg);
    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const newWaste: WasteRecord = {
      id: newId,
      market_id: market.id,
      category_id: cat.id,
      quantity_kg: qty,
      description: description ? description.trim() : null,
      record_date: record_date || now.split('T')[0],
      status: 'AVAILABLE',
      recommended_pathway: rec.recommended_pathway,
      estimated_value: rec.estimated_value,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };

    if (pool) {
      await pool.query(
        `INSERT INTO waste_records (id, market_id, category_id, quantity_kg, description, record_date, status, recommended_pathway, estimated_value, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [newWaste.id, newWaste.market_id, newWaste.category_id, newWaste.quantity_kg, newWaste.description, newWaste.record_date, newWaste.status, newWaste.recommended_pathway, newWaste.estimated_value, newWaste.created_by, newWaste.created_at, newWaste.updated_at]
      );
    }

    wasteRecords.push(newWaste);
    res.status(201).json(formatWasteRecord(newWaste));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to create waste record.');
  }
});

// ------------------------------------------
// 4. Pickup Workflow
// ------------------------------------------
function formatPickup(p: PickupRequest) {
  const waste = wasteRecords.find(w => w.id === p.waste_record_id);
  const market = markets.find(m => m.id === p.market_id);
  const collector = p.collector_id ? profiles.find(u => u.id === p.collector_id) : null;
  const category = waste ? wasteCategories.find(c => c.id === waste.category_id) : null;

  return {
    id: p.id,
    waste_record_id: p.waste_record_id,
    market_id: p.market_id,
    market_name: market ? market.name : null,
    market_location: market ? market.location : null,
    market_area: market ? market.area : null,
    category_name: category ? category.name : 'Uncategorized',
    quantity_kg: waste ? waste.quantity_kg : 0,
    recommended_pathway: waste ? waste.recommended_pathway : null,
    estimated_value: waste ? waste.estimated_value : 0,
    collector_id: p.collector_id || null,
    collector_name: collector ? collector.name : null,
    status: p.status,
    requested_at: p.requested_at,
    accepted_at: p.accepted_at || null,
    collected_at: p.collected_at || null,
    notes: p.notes || null,
  };
}

apiRouter.post('/pickups', requireRole(['ADMIN', 'MARKET_MANAGER']), async (req, res) => {
  try {
    const { waste_record_id, notes } = req.body;
    const waste = wasteRecords.find(w => w.id === waste_record_id);
    if (!waste) {
      return res.status(404).json({ error: 'Waste record not found.', detail: 'Waste record not found.' });
    }

    const existing = pickupRequests.find(p => p.waste_record_id === waste_record_id);
    if (existing) {
      return res.status(400).json({
        error: 'A pickup request already exists for this waste record.',
        detail: 'Duplicate pickup request.',
      });
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const pickup: PickupRequest = {
      id: newId,
      waste_record_id: waste.id,
      market_id: waste.market_id,
      status: 'AVAILABLE',
      requested_at: now,
      notes: notes ? notes.trim() : null,
      created_at: now,
      updated_at: now,
    };

    if (pool) {
      await pool.query(
        `INSERT INTO pickup_requests (id, waste_record_id, market_id, status, requested_at, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [pickup.id, pickup.waste_record_id, pickup.market_id, pickup.status, pickup.requested_at, pickup.notes, pickup.created_at, pickup.updated_at]
      );
    }

    pickupRequests.push(pickup);
    res.status(201).json(formatPickup(pickup));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to create pickup request.');
  }
});

apiRouter.get('/pickups/available', (req, res) => {
  try {
    const { area } = req.query;
    let list = pickupRequests.filter(p => p.status === 'AVAILABLE');
    if (area) {
      list = list.filter(p => {
        const m = markets.find(x => x.id === p.market_id);
        return m && m.area.toLowerCase().includes((area as string).toLowerCase());
      });
    }
    const sorted = [...list].sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
    res.json(sorted.map(formatPickup));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch available pickups', detail: err.message });
  }
});

apiRouter.get('/pickups/my', requireRole(['ADMIN', 'COLLECTOR']), (req, res) => {
  try {
    const user = (req as any).user as Profile;
    const statusFilter = req.query.status_filter as string | undefined;
    let list = pickupRequests.filter(p => p.collector_id === user.id);
    if (statusFilter) {
      list = list.filter(p => p.status === statusFilter.toUpperCase());
    }
    const sorted = [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    res.json(sorted.map(formatPickup));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch collector pickups', detail: err.message });
  }
});

apiRouter.get('/pickups', requireAuth, (req, res) => {
  try {
    const { market_id, status_filter } = req.query;
    let list = pickupRequests;
    if (market_id) list = list.filter(p => p.market_id === market_id);
    if (status_filter) list = list.filter(p => p.status === (status_filter as string).toUpperCase());
    const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(sorted.map(formatPickup));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list pickups', detail: err.message });
  }
});

apiRouter.post('/pickups/:id/accept', requireRole(['ADMIN', 'COLLECTOR']), async (req, res) => {
  try {
    const user = (req as any).user as Profile;
    const pickup = pickupRequests.find(p => p.id === req.params.id);
    if (!pickup) return res.status(404).json({ error: 'Pickup request not found.', detail: 'Pickup request not found.' });

    if (pickup.status !== 'AVAILABLE') {
      return res.status(409).json({
        error: `Pickup is no longer available. Current status: ${pickup.status}.`,
        detail: 'Pickup already claimed or resolved.',
      });
    }

    const now = new Date().toISOString();
    pickup.collector_id = user.id;
    pickup.status = 'ACCEPTED';
    pickup.accepted_at = now;
    pickup.updated_at = now;

    const waste = wasteRecords.find(w => w.id === pickup.waste_record_id);
    if (waste) {
      waste.status = 'ACCEPTED';
      waste.updated_at = now;
    }

    if (pool) {
      await pool.query(
        'UPDATE pickup_requests SET collector_id = $1, status = $2, accepted_at = $3, updated_at = $4 WHERE id = $5',
        [pickup.collector_id, pickup.status, pickup.accepted_at, pickup.updated_at, pickup.id]
      );
      if (waste) {
        await pool.query('UPDATE waste_records SET status = $1, updated_at = $2 WHERE id = $3', ['ACCEPTED', now, waste.id]);
      }
    }

    res.json(formatPickup(pickup));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to accept pickup.');
  }
});

apiRouter.post('/pickups/:id/collect', requireRole(['ADMIN', 'COLLECTOR']), async (req, res) => {
  try {
    const user = (req as any).user as Profile;
    const pickup = pickupRequests.find(p => p.id === req.params.id);
    if (!pickup) return res.status(404).json({ error: 'Pickup request not found.', detail: 'Pickup not found.' });

    if (pickup.collector_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'You are not authorized to complete a pickup accepted by another collector.',
        detail: 'Forbidden.',
      });
    }
    if (pickup.status !== 'ACCEPTED') {
      return res.status(400).json({
        error: `Cannot mark as collected from current status: ${pickup.status}. Must be ACCEPTED.`,
        detail: 'Invalid status transition.',
      });
    }

    const now = new Date().toISOString();
    pickup.status = 'COLLECTED';
    pickup.collected_at = now;
    pickup.updated_at = now;

    const notes = req.body?.notes;
    if (notes) {
      pickup.notes = pickup.notes ? `${pickup.notes} | Note: ${notes}` : notes;
    }

    const waste = wasteRecords.find(w => w.id === pickup.waste_record_id);
    if (waste) {
      waste.status = 'COLLECTED';
      waste.updated_at = now;

      const cat = wasteCategories.find(c => c.id === waste.category_id);
      const rec = getRecommendation(cat ? cat.name : 'other', waste.quantity_kg, cat?.estimated_value_per_kg);

      const recycledKg = rec.recyclable ? waste.quantity_kg : 0;
      const compostedKg = rec.organic && rec.recommended_pathway === 'Composting' ? waste.quantity_kg : 0;

      const impact: ImpactRecord = {
        id: crypto.randomUUID(),
        market_id: pickup.market_id,
        waste_record_id: waste.id,
        quantity_recovered_kg: waste.quantity_kg,
        quantity_recycled_kg: recycledKg,
        quantity_composted_kg: compostedKg,
        estimated_value: waste.estimated_value,
        co2_impact_estimate: rec.co2_impact_estimate,
        recorded_at: now,
      };
      impactRecords.push(impact);

      if (pool) {
        await pool.query(
          'UPDATE pickup_requests SET status = $1, collected_at = $2, notes = $3, updated_at = $4 WHERE id = $5',
          [pickup.status, pickup.collected_at, pickup.notes, pickup.updated_at, pickup.id]
        );
        await pool.query('UPDATE waste_records SET status = $1, updated_at = $2 WHERE id = $3', ['COLLECTED', now, waste.id]);
        await pool.query(
          `INSERT INTO impact_records (id, market_id, waste_record_id, quantity_recovered_kg, quantity_recycled_kg, quantity_composted_kg, estimated_value, co2_impact_estimate, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [impact.id, impact.market_id, impact.waste_record_id, impact.quantity_recovered_kg, impact.quantity_recycled_kg, impact.quantity_composted_kg, impact.estimated_value, impact.co2_impact_estimate, impact.recorded_at]
        );
      }
    }

    res.json(formatPickup(pickup));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to complete pickup.');
  }
});

apiRouter.post('/pickups/:id/cancel', requireAuth, async (req, res) => {
  try {
    const pickup = pickupRequests.find(p => p.id === req.params.id);
    if (!pickup) return res.status(404).json({ error: 'Pickup not found.', detail: 'Pickup not found.' });

    if (pickup.status === 'COLLECTED') {
      return res.status(400).json({ error: 'Cannot cancel an already collected pickup.', detail: 'Invalid transition.' });
    }

    const now = new Date().toISOString();
    pickup.status = 'CANCELLED';
    pickup.updated_at = now;

    const waste = wasteRecords.find(w => w.id === pickup.waste_record_id);
    if (waste) {
      waste.status = 'CANCELLED';
      waste.updated_at = now;
    }

    if (pool) {
      await pool.query('UPDATE pickup_requests SET status = $1, updated_at = $2 WHERE id = $3', ['CANCELLED', now, pickup.id]);
      if (waste) {
        await pool.query('UPDATE waste_records SET status = $1, updated_at = $2 WHERE id = $3', ['CANCELLED', now, waste.id]);
      }
    }

    res.json(formatPickup(pickup));
  } catch (err: any) {
    handleDbError(err, res, 'Failed to cancel pickup.');
  }
});

// ------------------------------------------
// 5. Impact & Analytics
// ------------------------------------------
apiRouter.get('/impact/summary', (req, res) => {
  try {
    const totalWaste = wasteRecords.reduce((sum, w) => sum + w.quantity_kg, 0);
    const totalRecovered = impactRecords.reduce((sum, i) => sum + i.quantity_recovered_kg, 0);
    const totalRecycled = impactRecords.reduce((sum, i) => sum + i.quantity_recycled_kg, 0);
    const totalComposted = impactRecords.reduce((sum, i) => sum + i.quantity_composted_kg, 0);
    const totalValue = impactRecords.reduce((sum, i) => sum + i.estimated_value, 0);
    const totalCo2 = impactRecords.reduce((sum, i) => sum + i.co2_impact_estimate, 0);

    const totalPickups = pickupRequests.length;
    const collectedPickups = pickupRequests.filter(p => p.status === 'COLLECTED').length;
    const completionRate = totalPickups > 0 ? Math.round((collectedPickups / totalPickups) * 1000) / 10 : 0;

    const activeMarkets = markets.filter(m => m.status === 'ACTIVE').length;
    const activeCollectors = profiles.filter(p => p.role === 'COLLECTOR').length;

    res.json({
      total_waste_registered_kg: Math.round(totalWaste * 10) / 10,
      total_waste_recovered_kg: Math.round(totalRecovered * 10) / 10,
      total_waste_recycled_kg: Math.round(totalRecycled * 10) / 10,
      total_waste_composted_kg: Math.round(totalComposted * 10) / 10,
      total_estimated_value_bdt: Math.round(totalValue * 100) / 100,
      total_co2_impact_kg: Math.round(totalCo2 * 10) / 10,
      pickup_completion_rate: completionRate,
      active_markets_count: activeMarkets,
      active_collectors_count: activeCollectors,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute impact summary', detail: err.message });
  }
});

apiRouter.get('/impact/records', (req, res) => {
  try {
    const marketId = req.query.market_id as string | undefined;
    let list = impactRecords;
    if (marketId) list = list.filter(i => i.market_id === marketId);

    const sorted = [...list].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    const results = sorted.map(r => {
      const waste = wasteRecords.find(w => w.id === r.waste_record_id);
      const m = markets.find(x => x.id === r.market_id);
      const cat = waste ? wasteCategories.find(c => c.id === waste.category_id) : null;
      return {
        id: r.id,
        market_id: r.market_id,
        market_name: m ? m.name : null,
        waste_record_id: r.waste_record_id,
        category_name: cat ? cat.name : null,
        quantity_recovered_kg: r.quantity_recovered_kg,
        quantity_recycled_kg: r.quantity_recycled_kg,
        quantity_composted_kg: r.quantity_composted_kg,
        estimated_value: r.estimated_value,
        co2_impact_estimate: r.co2_impact_estimate,
        recorded_at: r.recorded_at,
      };
    });
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve impact records', detail: err.message });
  }
});

// ------------------------------------------
// 6. Sustainability Scoring
// ------------------------------------------
apiRouter.get('/sustainability/market/:id', (req, res) => {
  try {
    const m = markets.find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Market not found.', detail: 'Market not found.' });
    const score = calculateMarketScore(m.id);
    res.json({ ...score, market_name: m.name });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute sustainability score', detail: err.message });
  }
});

apiRouter.get('/sustainability/markets', (req, res) => {
  try {
    const active = markets.filter(m => m.status === 'ACTIVE');
    const results = active.map(m => {
      const score = calculateMarketScore(m.id);
      return { ...score, market_name: m.name };
    });
    results.sort((a, b) => b.total_score - a.total_score);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list market scores', detail: err.message });
  }
});

// ------------------------------------------
// 7. Dashboard Analytics
// ------------------------------------------
apiRouter.get('/dashboard/stats', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as Profile;
    let targetMarketId = req.query.market_id as string | undefined;

    if (user.role === 'MARKET_MANAGER' && !targetMarketId) {
      const myMarket = markets.find(m => m.manager_id === user.id);
      if (myMarket) targetMarketId = myMarket.id;
    }

    let filteredWaste = wasteRecords;
    let filteredPickups = pickupRequests;
    let filteredImpact = impactRecords;

    if (targetMarketId) {
      filteredWaste = filteredWaste.filter(w => w.market_id === targetMarketId);
      filteredPickups = filteredPickups.filter(p => p.market_id === targetMarketId);
      filteredImpact = filteredImpact.filter(i => i.market_id === targetMarketId);
    }

    if (user.role === 'COLLECTOR') {
      filteredPickups = filteredPickups.filter(p => p.collector_id === user.id);
      const collectorWasteIds = filteredPickups.filter(p => p.status === 'COLLECTED').map(p => p.waste_record_id);
      filteredImpact = filteredImpact.filter(i => collectorWasteIds.includes(i.waste_record_id));
    }

    const totalRegisteredKg = Math.round(filteredWaste.reduce((s, w) => s + w.quantity_kg, 0) * 10) / 10;
    const totalRecoveredKg = Math.round(filteredImpact.reduce((s, i) => s + i.quantity_recovered_kg, 0) * 10) / 10;
    const totalRecycledKg = Math.round(filteredImpact.reduce((s, i) => s + i.quantity_recycled_kg, 0) * 10) / 10;
    const totalCompostedKg = Math.round(filteredImpact.reduce((s, i) => s + i.quantity_composted_kg, 0) * 10) / 10;
    const estimatedResourceValueBdt = Math.round(filteredWaste.reduce((s, w) => s + w.estimated_value, 0) * 100) / 100;

    const totalP = filteredPickups.length;
    const collP = filteredPickups.filter(p => p.status === 'COLLECTED').length;
    const pickupCompletionRate = totalP > 0 ? Math.round((collP / totalP) * 1000) / 10 : 0;

    const recentWasteCount = filteredWaste.length;
    const pendingPickupsCount = filteredPickups.filter(p => ['AVAILABLE', 'ACCEPTED'].includes(p.status)).length;

    let scoreVal: number | null = null;
    let scoreLabel: string | null = null;
    if (targetMarketId) {
      const s = calculateMarketScore(targetMarketId);
      scoreVal = s.total_score;
      scoreLabel = s.score_label;
    } else {
      const allScores = markets.filter(m => m.status === 'ACTIVE').map(m => calculateMarketScore(m.id).total_score);
      if (allScores.length > 0) {
        scoreVal = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10;
        if (scoreVal >= 80) scoreLabel = 'Excellent';
        else if (scoreVal >= 60) scoreLabel = 'Good';
        else if (scoreVal >= 40) scoreLabel = 'Developing';
        else scoreLabel = 'Needs Improvement';
      }
    }

    // Chart 1: Category
    const catTotals: Record<string, number> = {};
    filteredWaste.forEach(w => {
      const cat = wasteCategories.find(c => c.id === w.category_id);
      const name = cat ? cat.name : 'Unclassified';
      catTotals[name] = (catTotals[name] || 0) + w.quantity_kg;
    });
    const catLabels = Object.keys(catTotals).length > 0 ? Object.keys(catTotals) : ['Vegetable Waste', 'Fruit Waste', 'Plastic', 'Paper/Cardboard', 'Fish Waste'];
    const catValues = catLabels.map(l => Math.round((catTotals[l] || 0) * 10) / 10);
    const chartWasteByCategory = {
      labels: catLabels,
      datasets: [{
        label: 'Registered (KG)',
        data: catValues,
        backgroundColor: ['#16a34a', '#f59e0b', '#0284c7', '#8b5cf6', '#ef4444', '#64748b'],
      }],
    };

    // Chart 2: Monthly Waste
    const monthLabels: string[] = [];
    const monthlyData: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthLabels.push(key);
      monthlyData[key] = 0;
    }
    filteredWaste.forEach(w => {
      const d = new Date(w.record_date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += w.quantity_kg;
      }
    });
    const chartMonthlyWaste = {
      labels: monthLabels,
      datasets: [{
        label: 'Waste Registered (KG)',
        data: monthLabels.map(m => Math.round((monthlyData[m] || 0) * 10) / 10),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 2,
      }],
    };

    // Chart 3: Recovery Trend
    const unrec = Math.max(0, Math.round((totalRegisteredKg - totalRecoveredKg) * 10) / 10);
    const chartRecoveryTrend = {
      labels: ['Recovered / Diverted', 'Pending / Residual'],
      datasets: [{
        label: 'KG',
        data: [totalRecoveredKg, unrec],
        backgroundColor: ['#16a34a', '#e2e8f0'],
        borderColor: ['#15803d', '#cbd5e1'],
        borderWidth: 1,
      }],
    };

    // Chart 4: Pathway distribution
    const pathwayTotals: Record<string, number> = {};
    filteredWaste.forEach(w => {
      const p = w.recommended_pathway || 'Responsible Disposal';
      pathwayTotals[p] = (pathwayTotals[p] || 0) + w.quantity_kg;
    });
    const pathwayLabels = Object.keys(pathwayTotals).length > 0 ? Object.keys(pathwayTotals) : ['Composting', 'Recycling', 'Organic Fertilizer', 'Disposal'];
    const pathwayValues = pathwayLabels.map(p => Math.round((pathwayTotals[p] || 0) * 10) / 10);
    const chartResourcePathway = {
      labels: pathwayLabels,
      datasets: [{
        label: 'Pathway Volume (KG)',
        data: pathwayValues,
        backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#94a3b8'],
      }],
    };

    res.json({
      total_waste_registered_kg: totalRegisteredKg,
      total_waste_recovered_kg: totalRecoveredKg,
      total_waste_recycled_kg: totalRecycledKg,
      total_waste_composted_kg: totalCompostedKg,
      estimated_resource_value_bdt: estimatedResourceValueBdt,
      pickup_completion_rate: pickupCompletionRate,
      sustainability_score: scoreVal,
      sustainability_label: scoreLabel,
      recent_waste_count: recentWasteCount,
      pending_pickups_count: pendingPickupsCount,
      chart_waste_by_category: chartWasteByCategory,
      chart_monthly_waste: chartMonthlyWaste,
      chart_recovery_trend: chartRecoveryTrend,
      chart_resource_pathway: chartResourcePathway,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate dashboard analytics', detail: err.message });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Global Error]', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    detail: err.message || 'Internal Server Error',
  });
});

// ==========================================
// Vite / Static Frontend Mounting
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(distPath)) {
      // 1-year immutable cache for content-hashed Vite bundle assets
      app.use('/assets', express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      }));
      // 1-day cache for general static files (images, icons, etc.)
      app.use(express.static(distPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true,
      }));
    }
    app.get('*', (_req, res) => {
      if (fs.existsSync(indexPath)) {
        // Never cache index.html so updates are visible immediately on deploy
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application dist/index.html not found. Please ensure npm run build has completed.');
      }
    });
  }

  // Start listening on process.env.PORT as early as possible
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BazarCycle BD app running on http://0.0.0.0:${PORT} (PID ${process.pid})`);
    if (pool) {
      // Defer database initial synchronization to a background non-blocking microtask
      // so the server is already active and healthy on PORT immediately.
      setImmediate(() => {
        initDbSync().catch((e: any) => console.warn('Supabase initial sync notice:', e.message));
      });
    }
  });
}

start();
