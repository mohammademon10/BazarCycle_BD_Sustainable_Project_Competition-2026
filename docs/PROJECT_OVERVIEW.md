# 🌱 BazarCycle BD — Project Overview

> **Tagline:** Don't Dump It. Cycle It.  
> **Geographic Focus:** Dhaka & Municipal Agricultural Markets across Bangladesh  
> **Philosophy:** Deterministic, Audit-Ready, Explainable Transformation of Local Market Waste into Community Resources.

---

## 1. Executive Summary
BazarCycle BD is an end-to-end circular sustainability platform purpose-built for local agricultural wholesale bazars and wet markets in Bangladesh (such as Karwan Bazar, Jatrabari Krishi Market, and Mirpur-1 Municipal Bazar).

In Bangladesh's vibrant urban produce markets, hundreds of metric tons of surplus vegetables, fruit discards, fish trimmings, and bulk packaging materials accumulate daily. Without localized tracking and logistics incentives, these organic discards are indiscriminately dumped into municipal open heaps, producing uncontrolled methane emissions in landfills.

BazarCycle BD provides a decentralized digital workflow:
```
MARKET → WASTE → RESOURCE PATHWAY → COLLECTOR → RECOVERY → IMPACT
```
Market managers register waste batches, an explainable deterministic rule engine assigns resource pathways (Composting, Recycling, Organic Fertilizer), and nearby collection logistics providers claim and verify physical delivery to processing facilities.

---

## 2. Core Architecture
- **Frontend:** React 18, Vite, React Router 6, Chart.js / react-chartjs-2, Tailwind CSS.
- **Backend:** FastAPI (Python 3.13), SQLAlchemy ORM, Pydantic v2 validation, JWT authentication.
- **Database:** Supabase PostgreSQL (Standard PostgreSQL with local SQLite fallback for testing and offline development).
- **Rule Engine:** Deterministic rule matrix mapping verified waste categories to sustainable pathways with clear economic estimates in Bangladeshi Taka (BDT).
- **Security:** Bcrypt password hashing, signed JWT tokens, role-based authorization guards (`ADMIN`, `MARKET_MANAGER`, `COLLECTOR`), row-level concurrency lock on pickup claims.

---

## 3. UN Sustainable Development Goals (SDGs)
1. **SDG 11: Sustainable Cities and Communities (Target 11.6)**
   - Reduces adverse per-capita urban environmental impact by decentralizing organic waste segregation at wholesale collection points.
2. **SDG 12: Responsible Consumption and Production (Target 12.5)**
   - Substantially reduces market waste generation through circular redirection into bio-fertilizer and recyclables.
3. **SDG 13: Climate Action (Target 13.3)**
   - Mitigates fugitive methane emissions by substituting open anaerobic decay with managed aerobic composting.

---

## 4. Key Performance Metric: Bazar Sustainability Score
A project-defined quantitative rating (0–100) calculated from four weighted database indicators:
- **Waste Segregation (25%):** Proportion of logged batches categorized under specific streams versus unclassified mixed waste.
- **Waste Recovery (30%):** Ratio of verified collected waste to total logged market waste.
- **Recycling & Composting (20%):** Ratio of diverted materials directed into circular recovery vs conventional disposal.
- **Collection Efficiency (25%):** Fulfillment rate of requested pickup orders.

Qualitative Classification:
- `80–100`: **Excellent**
- `60–79`: **Good**
- `40–59`: **Developing**
- `0–39`: **Needs Improvement**
