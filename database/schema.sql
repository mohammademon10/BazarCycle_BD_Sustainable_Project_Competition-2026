-- ==============================================================================
-- BazarCycle BD — Complete Database Schema (PostgreSQL / Supabase Compatible)
-- Project: BazarCycle BD ("Don't Dump It. Cycle It.")
-- Target: Supabase PostgreSQL / Standard PostgreSQL 14+
-- ==============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if resetting (in reverse dependency order)
-- DROP TABLE IF EXISTS sustainability_scores CASCADE;
-- DROP TABLE IF EXISTS impact_records CASCADE;
-- DROP TABLE IF EXISTS pickup_requests CASCADE;
-- DROP TABLE IF EXISTS waste_records CASCADE;
-- DROP TABLE IF EXISTS waste_categories CASCADE;
-- DROP TABLE IF EXISTS markets CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES TABLE (Authentication & User Roles)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MARKET_MANAGER', 'COLLECTOR')),
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. MARKETS TABLE
CREATE TABLE IF NOT EXISTS markets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    manager_id VARCHAR(36) REFERENCES profiles(id) ON DELETE SET NULL,
    contact_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_markets_manager ON markets(manager_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);

-- 3. WASTE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS waste_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    waste_type VARCHAR(50) NOT NULL,
    resource_pathway VARCHAR(100) NOT NULL,
    estimated_value_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recyclable BOOLEAN NOT NULL DEFAULT FALSE,
    organic BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_waste_categories_name ON waste_categories(name);

-- 4. WASTE RECORDS TABLE
CREATE TABLE IF NOT EXISTS waste_records (
    id VARCHAR(36) PRIMARY KEY,
    market_id VARCHAR(36) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    category_id VARCHAR(36) NOT NULL REFERENCES waste_categories(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
    description TEXT,
    record_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ACCEPTED', 'COLLECTED', 'CANCELLED')),
    recommended_pathway VARCHAR(100) NOT NULL,
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_by VARCHAR(36) REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_waste_records_market ON waste_records(market_id);
CREATE INDEX IF NOT EXISTS idx_waste_records_category ON waste_records(category_id);
CREATE INDEX IF NOT EXISTS idx_waste_records_status ON waste_records(status);
CREATE INDEX IF NOT EXISTS idx_waste_records_date ON waste_records(record_date);

-- 5. PICKUP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS pickup_requests (
    id VARCHAR(36) PRIMARY KEY,
    waste_record_id VARCHAR(36) NOT NULL UNIQUE REFERENCES waste_records(id) ON DELETE CASCADE,
    market_id VARCHAR(36) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    collector_id VARCHAR(36) REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ACCEPTED', 'COLLECTED', 'CANCELLED')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickups_market ON pickup_requests(market_id);
CREATE INDEX IF NOT EXISTS idx_pickups_collector ON pickup_requests(collector_id);

-- 6. IMPACT RECORDS TABLE
CREATE TABLE IF NOT EXISTS impact_records (
    id VARCHAR(36) PRIMARY KEY,
    market_id VARCHAR(36) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    waste_record_id VARCHAR(36) NOT NULL REFERENCES waste_records(id) ON DELETE CASCADE,
    quantity_recovered_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity_recycled_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity_composted_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    co2_impact_estimate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_impact_market ON impact_records(market_id);
CREATE INDEX IF NOT EXISTS idx_impact_recorded_at ON impact_records(recorded_at);

-- 7. SUSTAINABILITY SCORES TABLE
CREATE TABLE IF NOT EXISTS sustainability_scores (
    id VARCHAR(36) PRIMARY KEY,
    market_id VARCHAR(36) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    segregation_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recovery_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recycling_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    collection_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    score_label VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_market ON sustainability_scores(market_id);
CREATE INDEX IF NOT EXISTS idx_scores_calculated ON sustainability_scores(calculated_at);
