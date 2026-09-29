# 📡 BazarCycle BD — API Documentation

Interactive Swagger documentation is available at `/docs` and ReDoc at `/redoc`.
Base API Prefix: `/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Register a new profile (`ADMIN`, `MARKET_MANAGER`, `COLLECTOR`).
- **Body:**
```json
{
  "name": "Salam Miah",
  "email": "collector@bazarcycle.bd",
  "phone": "+8801711000004",
  "role": "COLLECTOR",
  "password": "BazarCycle2026!"
}
```
- **Response (201 Created):**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-...",
    "name": "Salam Miah",
    "email": "collector@bazarcycle.bd",
    "role": "COLLECTOR"
  }
}
```

### `POST /api/auth/login`
Authenticate existing user and retrieve signed JWT.

### `GET /api/auth/me`
Retrieve currently authenticated user profile from JWT Bearer token.

---

## 2. Waste Categories & Recommendation (`/api/waste`)

### `GET /api/waste/categories`
Returns all registered waste categories and baseline BDT/KG valuation.

### `POST /api/waste/recommend`
Deterministic rule-based recommendation engine evaluation.
- **Request Body:**
```json
{
  "category_name": "Vegetable Waste",
  "quantity_kg": 150.0
}
```
- **Response (200 OK):**
```json
{
  "category": "Vegetable Waste",
  "recommended_pathway": "Composting",
  "quantity_kg": 150.0,
  "unit_rate_bdt": 15.0,
  "estimated_value": 2250.0,
  "explanation": "Vegetable waste is rich in nitrogen and organic moisture; it can be directly redirected into decentralized aerobic composting or municipal compost pits instead of open dumps.",
  "co2_impact_estimate": 67.5,
  "organic": true,
  "recyclable": false,
  "disclaimer": "Values are project estimates for demonstration purposes and may vary by location, quality, and market conditions."
}
```

### `POST /api/waste`
Market Manager creates new waste record. Validates `quantity_kg > 0`.

### `GET /api/waste`
List registered waste records. Supports query parameters: `market_id`, `category_id`, `status_filter`.

---

## 3. Pickup Workflow Endpoints (`/api/pickups`)

### `POST /api/pickups`
Market Manager creates a pickup request for a registered batch (sets status to `AVAILABLE`).

### `GET /api/pickups/available`
Returns all unclaimed pickup opportunities (`status == 'AVAILABLE'`).

### `POST /api/pickups/{id}/accept`
Collector accepts an available pickup request.
- **Concurrency Guard:** Employs database row locking / atomic state transition (`AVAILABLE -> ACCEPTED`). If two collectors attempt to claim simultaneously, one succeeds and the other receives `HTTP 409 Conflict`.

### `POST /api/pickups/{id}/collect`
Assigned Collector confirms collection.
- Transitions status to `COLLECTED`.
- Updates associated `waste_records.status` to `COLLECTED`.
- **Automatically creates `ImpactRecord`** logging recovered tonnage, composted/recycled mass, economic resource value, and avoided CO₂e.

---

## 4. Impact & Sustainability Score (`/api/impact` & `/api/sustainability`)

### `GET /api/impact/summary`
Public endpoint returning platform-wide aggregations:
- `total_waste_registered_kg`
- `total_waste_recovered_kg`
- `total_waste_composted_kg`
- `total_waste_recycled_kg`
- `total_estimated_value_bdt`
- `total_co2_impact_kg` (Clearly labelled Project Estimate)
- `pickup_completion_rate`

### `GET /api/sustainability/market/{market_id}`
Computes and returns the 4-component Bazar Sustainability Score (0–100):
- Waste Segregation (25%)
- Waste Recovery (30%)
- Recycling (20%)
- Collection Efficiency (25%)
- Label: `Needs Improvement` | `Developing` | `Good` | `Excellent`

---

## 5. Dashboard Metrics & Chart.js Data (`/api/dashboard`)

### `GET /api/dashboard/stats`
Returns aggregated KPI counters and the 4 required Chart.js datasets:
1. `chart_waste_by_category` (Doughnut)
2. `chart_monthly_waste` (Bar)
3. `chart_recovery_trend` (Doughnut)
4. `chart_resource_pathway` (Doughnut)
