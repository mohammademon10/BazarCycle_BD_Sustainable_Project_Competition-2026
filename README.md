<div align="center">

<img src="screenshots/logo.jpg" alt="BazarCycle BD Logo" width="280"/>

# 🌱 BazarCycle BD

### ♻️ Don't Dump It. Cycle It.

**A deterministic, rule-based circular waste-to-resource coordination platform engineered for Bangladesh's wholesale and municipal bazars.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![PostgreSQL / Supabase](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tests](https://img.shields.io/badge/Pytest-14%2F14%20Passed-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](#-testing--quality-assurance)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

**[📸 Live Screenshots](#-visual-tour--screenshots)** • 
**[🔄 Core Workflow](#-core-workflow)** • 
**[🧠 Rule Engine](#-deterministic-waste-to-resource-rule-engine)** • 
**[🏗️ Architecture](#️-system-architecture)** • 
**[🔌 API Docs](#-api-documentation)** • 
**[▶️ Local Setup](#️-installation--local-setup-guide)** • 
**[🏆 Competition Context](#-competition-context)**

</div>

---

## 📌 Project Overview

**BazarCycle BD** is a digital sustainability platform built specifically for Bangladesh's dense wholesale and retail market ecosystems (e.g., Karwan Bazar, Jatrabari Krishi Market, Mirpur-1 Municipal Market).

In Bangladeshi agricultural and fish bazars, hundreds of tons of organic discards, packaging plastics, and corrugated cardboard boxes are generated every morning. Traditionally, these materials are swept into open municipal heaps or landfill collection dumpsters, where anaerobic decomposition produces harmful methane emissions while informal recyclers lack timely coordination to retrieve valuable segregated materials.

BazarCycle BD bridges this structural gap by providing:
1. **Standardized Waste Logging:** On-site shed managers log segregated batches by weight (KG).
2. **Deterministic Resource Pathways:** Instant rule-based classification into composting, organic fertilizer, or recycling pathways—with zero black-box ML or third-party inference fees.
3. **Local Market Valuation (BDT):** Transparent estimated resource values based on current Dhaka material recovery benchmarks.
4. **Concurrency-Safe Pickup Logistics:** Row-level atomic state locking ensures independent waste collectors can claim and execute pickups without double-assignment conflicts.
5. **Auditable Sustainability Scoring (0–100):** Real-time quantitative scoring calculated directly from active database records measuring segregation, recovery rate, recycling diversion, and collection fulfillment.

> [!NOTE]  
> **Platform Classification:** BazarCycle BD is an explainable **Rule-Based Circular Economy Platform** built for the **Sustainable Project Competition 2026** at **Daffodil International University**. It operates using deterministic business rules and transparent equations; it does not utilize unverified machine learning or fabricated AI predictions.

---

## 📸 Visual Tour & Screenshots

All screenshots below represent the authentic, running application captured across all user roles and viewport dimensions.

### 🏠 Landing & Public Experience
<p align="center">
  <img src="screenshots/01-home.png" alt="BazarCycle BD Homepage" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Public landing page highlighting the circular mission, live Dhaka market statistics, workflow steps, and SDG alignment.</i></p>

---

### 🔐 Authentication & 1-Click Role Switcher
<p align="center">
  <img src="screenshots/02-login.png" alt="BazarCycle BD Login" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Sign-in portal equipped with 1-click Competition Demo Logins for Market Manager, Waste Collector, and Platform Administrator.</i></p>

---

### 🏪 Market Manager Workspace
<p align="center">
  <img src="screenshots/04-market-manager-dashboard.png" alt="Market Manager Dashboard" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Market Manager dashboard displaying registered batches, active pickup alerts, estimated value (BDT), and market score metrics.</i></p>

---

### ♻️ Waste Registration & Dynamic Valuation
<p align="center">
  <img src="screenshots/05-waste-registration.png" alt="Waste Registration Form" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Interactive waste logging form with real-time rule engine feedback showing recommended pathway, estimated BDT value, and avoided CO₂e.</i></p>

---

### 🧠 Rule-Based Resource Pathway Directory
<p align="center">
  <img src="screenshots/06-resource-pathway.png" alt="Resource Pathway View" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Comprehensive log of registered waste batches, their deterministic pathways (Composting, Recycling, Fertilizer), and pickup status.</i></p>

---

### 🚛 Collector Logistics & Concurrency Protected Dispatch
<p align="center">
  <img src="screenshots/07-pickup-workflow.png" alt="Pickup Workflow" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Collector opportunity browser: collectors view available market batches and accept them with atomic concurrency protection.</i></p>

---

### 🚜 Collector Operational Dashboard
<p align="center">
  <img src="screenshots/08-collector-dashboard.png" alt="Collector Dashboard" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Dedicated collector portal tracking active collections, cumulative recovered kilograms, completed routes, and estimated earnings.</i></p>

---

### 🌱 Bazar Sustainability Score (0–100)
<p align="center">
  <img src="screenshots/11-sustainability-score.png" alt="Bazar Sustainability Score" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Quantitative market audit scoring breakdown across Segregation (25%), Recovery (30%), Recycling (20%), and Collection Efficiency (25%).</i></p>

---

### 📊 Public Impact Analytics
<p align="center">
  <img src="screenshots/10-impact-dashboard.png" alt="Impact Dashboard" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Platform-wide public impact analytics computing diverted tonnage, avoided landfill emissions, and economic resource recovery.</i></p>

---

### 🛡️ Platform Administration
<p align="center">
  <img src="screenshots/09-admin-dashboard.png" alt="Admin Dashboard" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Administrator dashboard overseeing wholesale bazars, authorized accounts, material categories, and platform audit logs.</i></p>

---

### 📱 Responsive Mobile Layout
<p align="center">
  <img src="screenshots/12-mobile-view.png" alt="Mobile View" width="40%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</p>
<p align="center"><i>Fully responsive mobile interface optimized for market shed supervisors and collectors using smartphones on-site.</i></p>

---

## 🌱 What Makes BazarCycle BD Different

| Feature | Traditional Waste Disposal | Generic Waste Apps | BazarCycle BD |
| :--- | :--- | :--- | :--- |
| **Decision Engine** | None (Everything dumped) | Black-box ML / Third-party APIs | **Deterministic Rule Catalog** (100% explainable & free) |
| **Resource Valuation** | 0 BDT (Treated as junk) | Generic estimates | **Localized BDT Market Rates** (e.g., 15 BDT/KG organic, 35 BDT/KG plastic) |
| **Pickup Dispatch** | Informal telephone calls | Unprotected records | **Atomic Row-Level Locking** (`with_for_update` prevents race conditions) |
| **Market Evaluation** | Subjective opinions | Static ratings | **Dynamic 4-Factor Score (0–100)** computed directly from database tables |
| **Data Integrity** | Manual spreadsheets | Simulated numbers | **Zero Hallucinated Metrics** (Real-time SQL aggregations) |
| **Infrastructure Cost** | High municipal overhead | High AI API token costs | **Zero-dependency deployment** (Runs on free-tier Render + Supabase + Vercel) |

---

## ❗ Problem Statement

Bangladesh produces over 22,000 tons of solid waste daily, with Dhaka contributing a massive portion from its 400+ neighborhood and wholesale bazars. 

1. **Unsegregated Disposal:** Produce trimmings, spoiled fruit, fish viscera, and cardboard crates are commingled in open waste bins.
2. **Environmental & Climate Degradation:** Organic materials decompose anaerobically in open dumps (e.g., Matuail and Aminbazar), releasing methane ($CH_4$)—a greenhouse gas 28× more potent than $CO_2$.
3. **Disconnected Value Chain:** Commercial organic composters and plastic recycling aggregators lack real-time visibility into when clean, single-stream waste is ready for pickup.
4. **Lack of Performance Incentives:** Bazar committees have no quantifiable metric or public benchmark to assess their circular hygiene or motivate vendor segregation.

---

## 🎯 Objectives

- **Digitize Market Waste Registration:** Enable shed managers to record waste batches instantly with verified kilograms and dates.
- **Provide Explainable Transformations:** Deliver deterministic recommendations that explain *why* and *how* a material should be recycled, composted, or processed.
- **Unlock Latent Economic Value:** Provide real-time BDT estimates to demonstrate waste value and incentivize circular routing.
- **Prevent Pickup Race Conditions:** Guarantee database-level concurrency protection so two collectors never conflict over the same batch.
- **Audit Sustainability Quantitatively:** Calculate a mathematically sound 0–100 Bazar Sustainability Score from real operational activity.
- **Track Real Avoided Emissions:** Quantify avoided $CO_2e$ emissions based on established diversion factors.

---

## 🔄 Core Workflow

```mermaid
flowchart TD
    A[Wholesale Market Generates Discards] --> B[Market Manager Logs Waste Batch in Portal]
    B --> C{Deterministic Rule Engine}
    C -->|Vegetable / Fruit| D1[Pathway: Aerobic Composting]
    C -->|Fish Offal / Trimmings| D2[Pathway: Organic Bio-Fertilizer]
    C -->|Plastic Crates / PET| D3[Pathway: Industrial Polymer Recycling]
    C -->|Corrugated Cardboard| D4[Pathway: Paper Pulp Mill Reprocessing]
    
    D1 & D2 & D3 & D4 --> E[Calculated: Estimated BDT Value + Avoided CO₂e]
    E --> F[Market Manager Requests Collector Pickup]
    F --> G[Pickup Status: AVAILABLE]
    
    G --> H[Collector Browses Available Pickups]
    H --> I{Concurrency Guard: Atomic Row Lock}
    I -->|Winner| J[Status: ACCEPTED by Collector]
    I -->|Simultaneous Attempt| K[HTTP 409 Conflict: Already Claimed]
    
    J --> L[Collector Physically Retrieves Batch]
    L --> M[Collector Confirms Collection]
    M --> N[Status: COLLECTED]
    N --> O[(ImpactRecord & SustainabilityScore Updated in DB)]
    O --> P[Live Public Impact Dashboard & Market Rankings]
```

---

## 👥 User Roles & Permissions

The platform enforces strict role-based access control (RBAC) powered by signed JWT Bearer tokens:

| Feature / Action | Public Visitor | Market Manager | Waste Collector | Platform Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Public Impact Dashboard & Rankings | ✅ | ✅ | ✅ | ✅ |
| View Rule Engine Recommendations | ✅ (Preview) | ✅ | ✅ | ✅ |
| Log & Manage Market Waste Batches | ❌ | ✅ (Assigned Bazar) | ❌ | ✅ (All Bazars) |
| Request Pickup Dispatch | ❌ | ✅ | ❌ | ✅ |
| View Market Sustainability Score (0–100) | ❌ | ✅ | ❌ | ✅ |
| Browse Available Pickup Jobs | ❌ | ❌ | ✅ | ✅ |
| Claim Pickup (Concurrency Safe) | ❌ | ❌ | ✅ | ✅ |
| Complete Collection & Record Notes | ❌ | ❌ | ✅ (Claimed Jobs) | ✅ |
| Manage Markets, Categories & User Profiles | ❌ | ❌ | ❌ | ✅ |
| Generate System Audit & Executive Reports | ❌ | ❌ | ❌ | ✅ |

---

## 🧠 Deterministic Waste-to-Resource Rule Engine

> [!IMPORTANT]  
> The recommendation engine is **strictly deterministic**. It executes direct catalog rules with verified mathematical formulas. No black-box machine learning models or unpredictable external AI APIs are utilized.

### Catalog Rule Matrix

| Waste Category | Standard Pathway | Unit Rate (BDT/KG) | Avoided $CO_2e$ Factor | Engineering Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **Vegetable Waste** | Composting | ৳ 15.00 / KG | $0.45\text{ kg } CO_2e\text{/kg}$ | High moisture & nitrogen content; optimal for aerobic municipal windrow composting. |
| **Fruit Waste** | Composting | ৳ 12.00 / KG | $0.40\text{ kg } CO_2e\text{/kg}$ | Rapidly decomposing sugars accelerate bio-compost maturation and liquid fertilizer. |
| **Fish Waste** | Organic/Fertilizer Pathway | ৳ 25.00 / KG | $0.60\text{ kg } CO_2e\text{/kg}$ | High-protein offal and trimmings used for specialized agricultural fish-meal fertilizer. |
| **Plastic Packaging** | Mechanical Recycling | ৳ 35.00 / KG | $1.20\text{ kg } CO_2e\text{/kg}$ | Rigid containers, PET bottles, and crates baled and routed to local pelletizing plants. |
| **Paper / Cardboard** | Paper Mill Recycling | ৳ 18.00 / KG | $0.90\text{ kg } CO_2e\text{/kg}$ | Dry corrugated produce cartons and wrapping papers baled for pulp reprocessing mills. |
| **Other / Mixed** | Responsible Disposal | ৳ 5.00 / KG | $0.10\text{ kg } CO_2e\text{/kg}$ | Requires secondary manual sortation at transfer stations prior to sanitary disposal. |

### Valuation & Environmental Impact Equations
$$\text{Estimated Resource Value (BDT)} = \text{Quantity (KG)} \times \text{Unit Rate (BDT/KG)}$$
$$\text{Avoided Landfill Emissions } (CO_2e\text{ KG}) = \text{Quantity (KG)} \times \text{CO}_2\text{ Factor}$$

---

## 🚛 Concurrency-Safe Pickup Workflow

In active market logistics, multiple independent waste collectors might view the same lucrative pickup opportunity simultaneously. BazarCycle BD prevents double-assignment bugs through **atomic row-level database locking**:

```mermaid
sequenceDiagram
    autonumber
    actor CollectorA as Collector 1
    actor CollectorB as Collector 2
    participant API as FastAPI Router
    participant DB as PostgreSQL / SQLite
    
    CollectorA->>API: POST /api/pickups/{id}/accept
    CollectorB->>API: POST /api/pickups/{id}/accept
    
    critical Atomic Database Transaction
        API->>DB: SELECT * FROM pickup_requests WHERE id = :id FOR UPDATE
        Note over DB: Row is locked atomically. Collector 1 transaction executes first.
        DB-->>API: Returns pickup (status = AVAILABLE)
        API->>DB: UPDATE pickup_requests SET status = 'ACCEPTED', collector_id = 'c1'
        API->>DB: UPDATE waste_records SET status = 'ACCEPTED'
        API->>DB: COMMIT TRANSACTION
    end
    API-->>CollectorA: HTTP 200 OK (Pickup Assigned)
    
    critical Collector 2 Transaction
        API->>DB: SELECT * FROM pickup_requests WHERE id = :id FOR UPDATE
        DB-->>API: Returns pickup (status = ACCEPTED)
        Note over API: Condition fails (status != AVAILABLE)
    end
    API-->>CollectorB: HTTP 409 Conflict ("Pickup is no longer available.")
```

---

## 🌍 Sustainability Scoring & Impact Calculation

The **Bazar Sustainability Score** is a 0–100 quantitative benchmark designed to evaluate how efficiently an individual market manages its circular economy lifecycle.

### Mathematical Formulation

$$\text{Sustainability Score} = (S \times 0.25) + (R \times 0.30) + (C \times 0.20) + (E \times 0.25)$$

Where:
1. **Waste Segregation ($S$, weight 25%):**
   $$S = \left(\frac{\text{Kg of non-''other'' categorized waste}}{\text{Total registered waste kg}}\right) \times 100$$
2. **Waste Recovery ($R$, weight 30%):**
   $$R = \left(\frac{\text{Kg of successfully collected waste}}{\text{Total registered waste kg}}\right) \times 100$$
3. **Recycling & Composting Diversion ($C$, weight 20%):**
   $$C = \left(\frac{\text{Kg collected into organic or recyclable streams}}{\text{Total registered waste kg}}\right) \times 100$$
4. **Collection Efficiency ($E$, weight 25%):**
   $$E = \left(\frac{\text{Number of completed pickups}}{\text{Total requested pickups}}\right) \times 100$$

### Performance Rating Bands
- **80 – 100:** `Excellent` — High segregation hygiene, rapid collector fulfillment, minimal landfill residual.
- **60 – 79:** `Good` — Effective recovery with opportunities to expand clean segregation.
- **40 – 59:** `Developing` — Active collection underway; needs improvements in prompt dispatch.
- **0 – 39:** `Needs Improvement` — Significant uncollected waste or low material segregation.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (Vercel)"]
        UI[React 18 + Vite SPA]
        Router[React Router DOM v6]
        State[AuthContext + Axios Interceptors]
        Charts[Chart.js + Lucide Icons]
        Tailwind[Tailwind CSS Eco Palette]
        UI --> Router --> State --> Charts
    end

    subgraph APILayer["Backend REST API (Render / Python 3.13)"]
        FastAPI[FastAPI Application Instance]
        AuthGuard[JWT Bearer Security Middleware]
        PydanticSchema[Pydantic v2 Schema Validators]
        
        subgraph BusinessServices["Domain Services"]
            RuleEngine[WasteRecommendationEngine]
            PickupService[Concurrency-Safe PickupService]
            ScoreService[SustainabilityScoreService]
        end
        
        FastAPI --> AuthGuard --> PydanticSchema
        PydanticSchema --> RuleEngine & PickupService & ScoreService
    end

    subgraph DataLayer["Persistence Layer (Supabase / SQLite)"]
        SQLAlchemy[SQLAlchemy 2.0 ORM Engine]
        Postgres[(Supabase PostgreSQL / Cloud Postgres)]
        SQLite[(Local SQLite Fallback: bazarcycle.db)]
        
        BusinessServices --> SQLAlchemy
        SQLAlchemy -->|Production| Postgres
        SQLAlchemy -->|Local Development| SQLite
    end

    ClientLayer -- "HTTPS / JSON REST API" --> APILayer
```

---

## 🔄 Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as React Vite Frontend
    participant API as FastAPI REST Gateway
    participant Val as Pydantic v2 Schema
    participant Engine as Rule / Score Engine
    participant DB as SQLAlchemy / PostgreSQL
    
    User->>Front: Interacts with UI (e.g. Logs Waste / Requests Pickup)
    Front->>Front: Attaches JWT Bearer Header via Axios Interceptor
    Front->>API: HTTP Request (JSON Payload)
    API->>API: Verifies JWT Signature & Role Claims
    API->>Val: Validates Types & Positive Constraints (quantity > 0)
    Val-->>API: Validated Request Model
    API->>Engine: Executes Deterministic Business Logic
    Engine->>DB: Query or Atomic Transaction (with_for_update)
    DB-->>Engine: Committed DB Entity
    Engine-->>API: Computed Data Structure
    API-->>Front: HTTP 200 Response (Clean Pydantic Schema)
    Front->>User: UI State Updates Reactively (Charts & Tables)
```

---

## 🗄️ Database Design

### Database Tables Catalog

| Table | Entity Purpose | Primary Key | Key Foreign Keys & Constraints |
| :--- | :--- | :--- | :--- |
| `profiles` | User accounts, credentials, and role privileges | `id` (UUID / Str) | Unique `email`, Role `CHECK ('ADMIN', 'MARKET_MANAGER', 'COLLECTOR')` |
| `markets` | Municipal and wholesale bazars across Bangladesh | `id` (UUID / Str) | `manager_id -> profiles(id)`, Status `CHECK ('ACTIVE', 'INACTIVE')` |
| `waste_categories` | Waste definitions, default rates, and pathways | `id` (UUID / Str) | Unique `name`, `estimated_value_per_kg >= 0`, boolean flags |
| `waste_records` | Individual waste batches registered by shed managers | `id` (UUID / Str) | `market_id -> markets(id)`, `category_id -> waste_categories(id)`, `quantity_kg > 0` |
| `pickup_requests` | Logistics dispatch requests and collection status | `id` (UUID / Str) | Unique `waste_record_id -> waste_records(id)`, `collector_id -> profiles(id)` |
| `impact_records` | Historic logs of collected mass, avoided emissions, and value | `id` (UUID / Str) | `waste_record_id -> waste_records(id)`, `market_id -> markets(id)` |
| `sustainability_scores` | Periodic snapshots of calculated 4-factor market score | `id` (UUID / Str) | `market_id -> markets(id)`, scores `0.00 to 100.00` |

### Entity-Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ MARKETS : "manages"
    PROFILES ||--o{ WASTE_RECORDS : "creates"
    PROFILES ||--o{ PICKUP_REQUESTS : "collects"
    
    MARKETS ||--o{ WASTE_RECORDS : "contains"
    MARKETS ||--o{ PICKUP_REQUESTS : "originates"
    MARKETS ||--o{ IMPACT_RECORDS : "tracks"
    MARKETS ||--o{ SUSTAINABILITY_SCORES : "evaluates"
    
    WASTE_CATEGORIES ||--o{ WASTE_RECORDS : "classifies"
    
    WASTE_RECORDS ||--|| PICKUP_REQUESTS : "dispatches"
    WASTE_RECORDS ||--o| IMPACT_RECORDS : "generates"
    
    PROFILES {
        string id PK
        string name
        string email UK
        string role
        string hashed_password
        timestamp created_at
    }
    
    MARKETS {
        string id PK
        string name
        string location
        string area
        string manager_id FK
        string status
    }
    
    WASTE_CATEGORIES {
        string id PK
        string name UK
        string waste_type
        string resource_pathway
        decimal estimated_value_per_kg
        boolean recyclable
        boolean organic
    }
    
    WASTE_RECORDS {
        string id PK
        string market_id FK
        string category_id FK
        decimal quantity_kg
        string status
        string recommended_pathway
        decimal estimated_value
        date record_date
    }
    
    PICKUP_REQUESTS {
        string id PK
        string waste_record_id FK,UK
        string market_id FK
        string collector_id FK
        string status
        timestamp requested_at
        timestamp accepted_at
        timestamp collected_at
    }
    
    IMPACT_RECORDS {
        string id PK
        string market_id FK
        string waste_record_id FK
        decimal quantity_recovered_kg
        decimal quantity_recycled_kg
        decimal quantity_composted_kg
        decimal estimated_value
        decimal co2_impact_estimate
    }
    
    SUSTAINABILITY_SCORES {
        string id PK
        string market_id FK
        decimal segregation_score
        decimal recovery_score
        decimal recycling_score
        decimal collection_score
        decimal total_score
        string score_label
    }
```

---

## 🔌 API Documentation

FastAPI automatically generates an interactive Swagger UI documentation at `http://localhost:8000/docs`.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `phone`, `role`). |
| `POST` | `/api/auth/login` | Public | Authenticate with credentials and receive signed JWT Bearer token. |
| `GET` | `/api/auth/me` | Bearer Token | Retrieve profile information for the authenticated user. |

### Waste Records & Rule Engine (`/api/waste`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/waste/recommend` | Public / Token | Execute deterministic rule engine for a category and quantity. |
| `GET` | `/api/waste/categories` | Public / Token | List all available waste categories and default rates. |
| `POST` | `/api/waste/categories` | Admin | Create a new waste category in the system. |
| `GET` | `/api/waste/records` | Bearer Token | List waste records filtered by market or manager ownership. |
| `POST` | `/api/waste/records` | Manager / Admin | Register a new waste batch with automatic pathway and value assignment. |
| `GET` | `/api/waste/records/{id}` | Bearer Token | Retrieve full record details for a specific waste batch. |

### Pickup & Logistics Endpoints (`/api/pickups`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/pickups/available` | Collector / Admin | Browse all unassigned pickups with status `AVAILABLE`. |
| `POST` | `/api/pickups/request` | Manager / Admin | Dispatch a pickup request for an available waste batch. |
| `POST` | `/api/pickups/{id}/accept` | Collector | Concurrency-safe pickup assignment (atomic row lock). |
| `POST` | `/api/pickups/{id}/complete`| Collector | Mark pickup as `COLLECTED` and record `ImpactRecord`. |
| `GET` | `/api/pickups/my` | Collector | List pickups claimed or completed by the authenticated collector. |
| `GET` | `/api/pickups/market/{id}` | Manager / Admin | List pickup requests associated with a specific market. |
| `GET` | `/api/pickups/all` | Admin | System-wide administrative audit of all pickups. |

### Impact & Sustainability Score (`/api/impact` & `/api/sustainability`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/impact/summary` | Public | Aggregate platform totals: waste logged, recovered, BDT value, avoided CO₂. |
| `GET` | `/api/impact/market/{id}` | Public / Token | Market-specific diversion metrics and historical volumes. |
| `GET` | `/api/impact/trends` | Public | Monthly and category-wise recovery trend distributions. |
| `GET` | `/api/sustainability/score/{market_id}` | Manager / Admin | Calculate and return live 4-component score (0–100). |

### Dashboard Aggregate Endpoints (`/api/dashboard`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/dashboard/market-manager`| Manager | Aggregated KPI counts, pending dispatches, recent logs, and score. |
| `GET` | `/api/dashboard/collector` | Collector | Active collections, completed tonnage, earnings estimate, and open jobs. |
| `GET` | `/api/dashboard/admin` | Admin | Platform-level statistics: total markets, users, waste, and pickups. |

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose in BazarCycle BD |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | **React** | `18.3.1` | Modular Single Page Application (SPA) architecture |
| **Build Tool** | **Vite** | `8.3.1` | Ultra-fast HMR and optimized production bundling |
| **Styling & Design** | **Tailwind CSS** | `3.4.17` | Responsive eco-palette styling and utility layout system |
| **Routing** | **React Router DOM** | `6.28.0` | Client-side declarative routing and role-based route guards |
| **Data Visualization** | **Chart.js & react-chartjs-2**| `4.4.7` | Doughnut, Bar, and Line charts rendering live database impact |
| **Icons & Micro-UI** | **Lucide React** | `0.468.0` | Crisp SVG iconography across navigation, actions, and KPI cards |
| **HTTP Client** | **Axios** | `1.7.9` | Promise-based API requests with automatic JWT interceptors |
| **Backend Framework** | **FastAPI** | `0.115.6` | Asynchronous Python REST API with automatic OpenAPI docs |
| **Language Runtime** | **Python** | `3.13` | Modern, performant backend execution runtime |
| **ORM & Data Access** | **SQLAlchemy** | `2.0.36` | Declarative relational database modeling and transactional locking |
| **Schema Validation** | **Pydantic** | `2.10.4` | Strict input parsing, constraints (`quantity > 0`), and serialization |
| **Authentication** | **PyJWT** | `2.10.1` | Cryptographically signed HMAC-SHA256 bearer tokens |
| **Password Security** | **Bcrypt** | `4.2.1` | Direct salted password hashing with adaptive cost factor |
| **Primary Database** | **PostgreSQL / Supabase**| `14+` | Production relational database with transactional integrity |
| **Dev Database** | **SQLite** | `3.x` | Zero-dependency local file database fallback (`bazarcycle.db`) |
| **Testing Suite** | **Pytest & HTTPX** | `8.3.4` | Automated unit testing, validation guards, and API integration tests |

---

## 📁 Project Structure

```text
BazarCycle_BD/
│
├── .gitignore                      # Git exclusion rules (node_modules, venv, secrets, db)
├── DEPLOYMENT.md                   # Cloud deployment manual (Vercel, Render, Supabase)
├── LICENSE                         # Official MIT License
├── README.md                       # Master technical documentation
├── SUPABASE_SETUP.md               # Supabase PostgreSQL initialization guide
│
├── database/
│   └── schema.sql                  # Complete PostgreSQL DDL schema & indexes
│
├── screenshots/                    # Authentic application UI screenshots
│   ├── 01-home.png
│   ├── 02-login.png
│   ├── 03-register.png
│   ├── 04-market-manager-dashboard.png
│   ├── 05-waste-registration.png
│   ├── 06-resource-pathway.png
│   ├── 07-pickup-workflow.png
│   ├── 08-collector-dashboard.png
│   ├── 09-admin-dashboard.png
│   ├── 10-impact-dashboard.png
│   ├── 11-sustainability-score.png
│   └── 12-mobile-view.png
│
├── backend/
│   ├── .env.example                # Backend configuration template
│   ├── pytest.ini                  # Pytest runner settings
│   ├── requirements.txt            # Python dependencies
│   ├── seed.py                     # Demo seeder for markets, categories & accounts
│   │
│   ├── app/
│   │   ├── database.py             # SQLAlchemy session & engine lifecycle
│   │   ├── main.py                 # FastAPI application, middleware & router inclusion
│   │   │
│   │   ├── models/                 # SQLAlchemy 2.0 ORM entities
│   │   │   ├── impact.py
│   │   │   ├── markets.py
│   │   │   ├── pickup.py
│   │   │   ├── profiles.py
│   │   │   ├── sustainability.py
│   │   │   └── waste.py
│   │   │
│   │   ├── routers/                # REST API route handlers
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── impact.py
│   │   │   ├── markets.py
│   │   │   ├── pickups.py
│   │   │   ├── sustainability.py
│   │   │   └── waste.py
│   │   │
│   │   ├── schemas/                # Pydantic v2 validation contracts
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── impact.py
│   │   │   ├── market.py
│   │   │   ├── pickup.py
│   │   │   └── waste.py
│   │   │
│   │   └── services/               # Deterministic business logic & algorithms
│   │       ├── pickup_service.py
│   │       ├── sustainability_score_service.py
│   │       └── waste_recommendation_service.py
│   │
│   └── tests/
│       └── test_bazarcycle.py      # Automated backend test suite (14 test cases)
│
└── frontend/
    ├── .env.example                # Frontend configuration template
    ├── index.html                  # HTML entry point
    ├── package.json                # NPM packages and build scripts
    ├── postcss.config.js           # PostCSS configuration
    ├── tailwind.config.js          # Tailwind CSS theme extensions
    ├── vite.config.js              # Vite bundler configuration
    │
    ├── public/
    │   ├── favicon.svg             # Application favicon
    │   └── images/                 # Documentary photos of Dhaka bazars
    │
    └── src/
        ├── App.jsx                 # Route registry & layout hierarchy
        ├── index.css               # Tailwind directives & animation keyframes
        ├── main.jsx                # React root mount
        │
        ├── components/             # Reusable UI components
        │   ├── Footer.jsx
        │   ├── Navbar.jsx
        │   ├── PageTransition.jsx
        │   └── ProtectedRoute.jsx
        │
        ├── context/
        │   └── AuthContext.jsx     # Authentication state & 1-click demo switcher
        │
        ├── pages/
        │   ├── admin/              # Administrator dashboards & management
        │   ├── collector/          # Collector logistics & collection logs
        │   ├── manager/            # Market manager registration & score audits
        │   └── public/             # Landing, About, How It Works, & Impact
        │
        └── services/
            └── api.js              # Axios instance with JWT interceptors
```

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)

```env
# Database Connection (Supabase PostgreSQL for production, or local SQLite)
DATABASE_URL=sqlite:///./bazarcycle.db
# Production Supabase URI Example:
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT Security
JWT_SECRET=bazarcycle_bd_super_secure_jwt_secret_key_change_in_production_2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Allowed CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Environment Designation
ENVIRONMENT=development
```

### Frontend Configuration (`frontend/.env`)

```env
# Base URL pointing to the FastAPI backend API
VITE_API_BASE_URL=http://localhost:8000/api
```

> [!CAUTION]  
> Never commit active production `.env` files with secret passwords or database tokens into public Git repositories. Templates are provided safely in `.env.example`.

---

## ▶️ Installation & Local Setup Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Python:** v3.11 or higher (Tested with Python 3.13)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/mohammademon10/BazarCycle_BD_Sustainable_Project_Competition-2026.git
cd BazarCycle_BD_Sustainable_Project_Competition-2026
```

### 2. Backend Setup
```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Run initial database seeder (Creates demo bazars, categories, users & records)
python seed.py

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install Node.js packages
npm install

# Start the Vite development server
npm run dev
```
- **Frontend Web Application:** `http://localhost:5173`

---

## 🔑 1-Click Demo Credentials

To streamline evaluation for competition judges and reviewers, pre-seeded accounts can be logged in with a single click via the **Competition Demo Panel** on the login page:

| Role | Demo Email | Demo Password | Scope / Assigned Market |
| :--- | :--- | :--- | :--- |
| **Market Manager** | `manager@bazarcycle.bd` | `BazarCycle2026!` | Karwan Bazar Wholesale Market |
| **Waste Collector** | `collector@bazarcycle.bd` | `BazarCycle2026!` | Dhaka Central Urban District |
| **Platform Admin** | `admin@bazarcycle.bd` | `BazarCycle2026!` | System-wide administrative permissions |

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

For production deployment with Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Open `database/schema.sql` from this repository, copy its entire contents, and execute it to create all tables, indexes, and constraints.
4. Copy the connection URI from **Settings -> Database** and assign it to `DATABASE_URL` in your backend host environment.

---

## 🧪 Testing & Quality Assurance

The backend includes an automated test suite executed via `pytest` covering deterministic rule matching, quantity validation guards, authentication security, pickup concurrency safety, and public aggregations.

### Running the Test Suite
```bash
cd backend
.\venv\Scripts\python -m pytest -v tests/
```

### Verified Test Execution Results
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-8.3.4
collected 14 items

tests/test_bazarcycle.py::test_recommendation_vegetable_waste PASSED     [  7%]
tests/test_bazarcycle.py::test_recommendation_fruit_waste PASSED         [ 14%]
tests/test_bazarcycle.py::test_recommendation_fish_waste PASSED          [ 21%]
tests/test_bazarcycle.py::test_recommendation_plastic PASSED             [ 28%]
tests/test_bazarcycle.py::test_recommendation_paper_cardboard PASSED     [ 35%]
tests/test_bazarcycle.py::test_recommendation_other PASSED               [ 42%]
tests/test_bazarcycle.py::test_recommendation_validation_zero_negative PASSED [ 50%]
tests/test_bazarcycle.py::test_login_valid_market_manager PASSED         [ 57%]
tests/test_bazarcycle.py::test_login_invalid_password PASSED             [ 64%]
tests/test_bazarcycle.py::test_register_and_login_new_user PASSED        [ 71%]
tests/test_bazarcycle.py::test_waste_recommend_api_endpoint PASSED       [ 78%]
tests/test_bazarcycle.py::test_waste_validation_rejects_negative_or_zero PASSED [ 85%]
tests/test_bazarcycle.py::test_pickup_and_concurrency_workflow PASSED    [ 92%]
tests/test_bazarcycle.py::test_public_impact_summary PASSED              [100%]

============================== 14 passed in 3.48s ==============================
```

### Production Build Verification
The React frontend production build was verified via `npm run build`:
```bash
cd frontend
npm run build
# Output: ✓ built in 6.31s (Zero errors, optimized bundles generated in dist/)
```

---

## 🛡️ Security Implementation

- **Direct Bcrypt Hashing:** Passwords are never stored in plaintext; salted and hashed with bcrypt.
- **Stateless JWT Tokens:** Authorization using HMAC-SHA256 signatures with configured expiration windows.
- **SQL Injection Prevention:** All database operations utilize SQLAlchemy 2.0 parameterized expressions and ORM abstractions.
- **Input Integrity Checks:** Strict Pydantic v2 schemas reject negative or zero waste quantities (`quantity_kg > 0`).
- **Concurrency Safety:** Explicit `with_for_update()` row locks prevent race conditions during pickup acceptance.
- **Strict CORS Origin Whitelisting:** Backend rejects unapproved cross-origin requests in production.

---

## ☁️ Deployment Architecture

```text
  GitHub Repository (main branch)
         │
         ├───► Vercel (Frontend React + Vite SPA)
         │       • Build: npm run build
         │       • Output: dist
         │       • Env: VITE_API_BASE_URL
         │
         ├───► Render / Railway (Backend FastAPI REST API)
         │       • Build: pip install -r requirements.txt
         │       • Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
         │       • Env: DATABASE_URL, JWT_SECRET, CORS_ORIGINS
         │
         └───► Supabase (Managed Cloud PostgreSQL Database)
                 • DDL Schema: database/schema.sql
                 • Connection Pooling: Port 6543 / 5432
```

---

## 🌍 UN Sustainable Development Goals (SDGs)

BazarCycle BD is directly aligned with three United Nations Sustainable Development Goals:

- **SDG 11: Sustainable Cities & Communities (Target 11.6)**  
  Reduces the adverse per capita environmental impact of urban centers by significantly diminishing open municipal solid waste dumping at major Dhaka markets.
- **SDG 12: Responsible Consumption & Production (Target 12.5)**  
  Substantially reduces waste generation through prevention, reduction, recycling, and composting of organic trimmings and transport packaging.
- **SDG 13: Climate Action (Target 13.3)**  
  Mitigates landfill methane emissions ($CH_4$) by diverting biodegradable organic materials into managed aerobic composting and organic fertilizer facilities.

---

## 🏆 Competition Context

- **Event:** Sustainable Project Competition 2026
- **Institution:** Daffodil International University (DIU), Bangladesh
- **Focus Area:** Circular Economy, Waste-to-Resource Logistics, Environmental Sustainability
- **Project Designation:** Working Prototype & Competition Demonstration

---

## 🚀 Project Status

🟢 **Status: Fully Functional Working Prototype (Competition-Ready)**

- [x] Complete React 18 + Vite Frontend with responsive Tailwind CSS
- [x] High-performance FastAPI REST API backend (Python 3.13)
- [x] Deterministic Waste-to-Resource Recommendation Engine
- [x] Role-Based Access Control (Admin, Market Manager, Waste Collector)
- [x] 1-Click Competition Demo Logins
- [x] Concurrency-safe pickup claiming workflow (`with_for_update`)
- [x] Mathematical 4-component Bazar Sustainability Score (0–100)
- [x] Real-time Chart.js visualizations for recovery and diversion
- [x] 14/14 Pytest automated test cases passing
- [x] Production build verified without compilation errors
- [x] Supabase PostgreSQL & SQLite dual-database compatibility

---

## 🔮 Future Roadmap

The following items are planned enhancements for future iterations beyond the initial competition prototype:
1. **Offline Progressive Web App (PWA):** Enable market shed supervisors to record waste in weak-connectivity bazar basements.
2. **IoT Ultrasonic Fill Sensors:** Integration with smart waste bins at major produce sheds for automated pickup triggers.
3. **Bengali (বাংলা) Localization:** Dual-language UI support to improve usability for non-English literate market staff.
4. **City Corporation Integration:** Direct API dispatch webhooks connecting with DNCC and DSCC waste vehicle logistics.

---

## 📸 Complete UI Gallery

<details>
<summary><b>🌐 Public Experience & Landing</b></summary>
<br>

<p align="center">
  <img src="screenshots/01-home.png" alt="Public Landing Page" width="90%">
  <br>
  <i>Public landing page presenting the waste-to-resource journey, platform metrics, and circular mission.</i>
</p>

<p align="center">
  <img src="screenshots/10-impact-dashboard.png" alt="Public Impact Dashboard" width="90%">
  <br>
  <i>Public environmental analytics visualizing diverted tonnage, avoided CO₂, and economic valuation.</i>
</p>

</details>

<details>
<summary><b>🔐 Authentication & Role Switching</b></summary>
<br>

<p align="center">
  <img src="screenshots/02-login.png" alt="Login Page" width="90%">
  <br>
  <i>Authentication portal with 1-click Competition Demo credentials for immediate evaluation.</i>
</p>

<p align="center">
  <img src="screenshots/03-register.png" alt="Registration Page" width="90%">
  <br>
  <i>Self-registration form supporting Market Manager, Collector, and Administrator roles.</i>
</p>

</details>

<details>
<summary><b>🏪 Market Manager Workflows</b></summary>
<br>

<p align="center">
  <img src="screenshots/04-market-manager-dashboard.png" alt="Market Manager Dashboard" width="90%">
  <br>
  <i>Operational hub for shed managers displaying active batches, score badges, and recent logs.</i>
</p>

<p align="center">
  <img src="screenshots/05-waste-registration.png" alt="Waste Registration Form" width="90%">
  <br>
  <i>Batch registration interface with instant rule-based recommendation and BDT valuation feedback.</i>
</p>

<p align="center">
  <img src="screenshots/06-resource-pathway.png" alt="Resource Pathway View" width="90%">
  <br>
  <i>Detailed inventory of market waste records showing assigned transformation pathways.</i>
</p>

<p align="center">
  <img src="screenshots/11-sustainability-score.png" alt="Sustainability Score Breakdown" width="90%">
  <br>
  <i>Four-factor score breakdown detailing Segregation, Recovery, Recycling, and Collection Efficiency.</i>
</p>

</details>

<details>
<summary><b>🚛 Collector Workflows</b></summary>
<br>

<p align="center">
  <img src="screenshots/08-collector-dashboard.png" alt="Collector Dashboard" width="90%">
  <br>
  <i>Collector overview displaying active tasks, cumulative recovered mass, and route history.</i>
</p>

<p align="center">
  <img src="screenshots/07-pickup-workflow.png" alt="Available Pickups" width="90%">
  <br>
  <i>Opportunity board where collectors claim available market pickups with concurrency locking.</i>
</p>

</details>

<details>
<summary><b>🛡️ Platform Administration</b></summary>
<br>

<p align="center">
  <img src="screenshots/09-admin-dashboard.png" alt="Admin Dashboard" width="90%">
  <br>
  <i>Platform-wide administrator console managing markets, users, categories, and system audits.</i>
</p>

</details>

<details>
<summary><b>📱 Responsive Mobile Interface</b></summary>
<br>

<p align="center">
  <img src="screenshots/12-mobile-view.png" alt="Mobile View" width="40%">
  <br>
  <i>Mobile-optimized interface ensuring smooth on-site operations for field workers.</i>
</p>

</details>

---

## 👥 Project Team & Contributors

- **Lead Developer & Architect:** [MD. Emon Hossain](https://github.com/mohammademon10)
- **Institution:** Daffodil International University (DIU), Bangladesh
- **Competition Submission:** Sustainable Project Competition 2026

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

---

## 🔗 Project Links

- **GitHub Repository:** [https://github.com/mohammademon10/BazarCycle_BD_Sustainable_Project_Competition-2026](https://github.com/mohammademon10/BazarCycle_BD_Sustainable_Project_Competition-2026)
- **Deployment Documentation:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Supabase Setup Manual:** [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Issue Tracker:** [Report an Issue / Suggestion](https://github.com/mohammademon10/BazarCycle_BD_Sustainable_Project_Competition-2026/issues)

---

<div align="center">
  <sub>Engineered with 🌱 for Bangladesh's sustainable circular future.</sub>
</div>
