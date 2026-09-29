# 🌱 BazarCycle BD

> **Tagline:** Don't Dump It. Cycle It.  
> **Mission:** Transforming Bangladesh's local market waste into community composting and verified recyclables through explainable, rule-based circular connectivity.

---

## 📌 1. Project Overview
**BazarCycle BD** is a Bangladesh-focused sustainability platform designed for wholesale and neighborhood agricultural bazars (e.g., Karwan Bazar, Jatrabari Krishi Market, Mirpur-1 Municipal Market).

The platform facilitates the complete waste-to-resource circular journey:
```
MARKET → WASTE → RESOURCE PATHWAY → COLLECTOR → RECOVERY → IMPACT
```

### Key Highlights:
- **Deterministic Rule Engine:** Transparent transformation recommendations (Composting, Recycling, Organic Fertilizer) without black-box ML or external API costs.
- **Estimated Resource Value (BDT):** Live valuation based on verified kilograms and local market rates.
- **Concurrency-Safe Pickup Workflow:** Row-level atomic state locking ensures two collectors cannot claim the same waste pickup.
- **Bazar Sustainability Score:** A project-defined metric (0–100) evaluating waste segregation, recovery rate, recycling efficiency, and collection fulfillment.
- **Authentic Bangladesh Photography:** Web-optimized documentary images of Dhaka markets, produce stalls, and recycling points with accessible fallbacks.
- **Zero Hallucinated Metrics:** All charts and impact figures are computed directly from live database tables.

---

## 🛑 2. Problem Statement
Every day, wholesale vegetable and fish bazars in Bangladesh generate massive quantities of organic trimmings and transport packaging. Traditionally, these materials are swept into open municipal disposal heaps, where anaerobic decomposition produces methane emissions in landfills. Meanwhile, informal recycling collectors lack real-time digital visibility into when and where segregated batches are available for pickup.

---

## 💡 3. Solution
BazarCycle BD provides a decentralized digital bridge:
1. **Market Managers** log daily waste streams and immediately receive rule-based transformation pathways and BDT valuations.
2. **Waste Collectors** browse live available opportunities, accept pickups with concurrency protection, and confirm collections.
3. **Public & Regulators** observe verified recovery statistics, avoided CO₂ estimates, and market sustainability rankings.

---

## 🛠️ 4. Technology Stack
- **Frontend:**
  - React 18 & Vite
  - JavaScript (ESNext)
  - React Router DOM v6
  - Tailwind CSS (Natural eco-palette)
  - Chart.js & react-chartjs-2
  - Lucide React Icons
  - Axios with JWT Interceptors
- **Backend:**
  - FastAPI (Python 3.13)
  - SQLAlchemy 2.0 ORM
  - Pydantic v2 (Input & schema validation)
  - Bcrypt (Direct password hashing)
  - PyJWT (Signed access tokens)
  - Pytest & HTTPX (Test automation)
- **Database:**
  - PostgreSQL / Supabase Compatible
  - SQLite fallback for zero-dependency local testing

---

## 📐 5. Architecture
```
                     BazarCycle BD
                           │
             ┌─────────────┴─────────────┐
             │                           │
       React + Vite                   FastAPI
         Frontend                     Backend
             │                           │
             └─────────────┬─────────────┘
                           ↓
                   PostgreSQL / Supabase
                   (or local SQLite)
```

---

## 👥 6. User Roles & Capabilities
| Role | Capabilities |
| :--- | :--- |
| **Platform Admin** | Manage markets, waste categories, user roles, system-wide pickups, and executive audit reports. |
| **Market Manager** | Onboard market batches, view real-time rule recommendations, request pickups, track logistics, view market sustainability scores. |
| **Waste Collector** | Browse available pickups across Dhaka bazars, accept jobs (race-condition protected), complete collections, view recovered tonnage. |

---

## 📊 7. Bazar Sustainability Score (0–100)
A project-defined quantitative rating for market performance:
- **Waste Segregation (25%):** Ratio of clean segregated categories vs unsorted waste.
- **Waste Recovery (30%):** Ratio of collected vs total registered volume.
- **Recycling & Composting (20%):** Volume directed into composting/recycling.
- **Collection Efficiency (25%):** Fulfillment rate of requested pickups.

**Score Classifications:**
- `80–100`: Excellent
- `60–79`: Good
- `40–59`: Developing
- `0–39`: Needs Improvement

---

## 🌍 8. UN Sustainable Development Goals (SDGs)
- **SDG 11: Sustainable Cities & Communities (Target 11.6)** — Enhancing municipal environmental hygiene at wholesale markets.
- **SDG 12: Responsible Consumption & Production (Target 12.5)** — Diverting organic matter and plastic into circular loops.
- **SDG 13: Climate Action (Target 13.3)** — Mitigating landfill methane emissions via managed aerobic composting.

---

## 💻 9. Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database seed (Creates demo markets, categories, and users)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be available at: [http://localhost:8000](http://localhost:8000)  
Interactive Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 10. Running Tests
To run the automated backend test suite (unit tests, validation tests, concurrency guards):
```bash
cd backend
.\venv\Scripts\pytest -v tests/
```
All 14 tests will execute and verify recommendation rules, positive quantity constraint, role authorization, and collector concurrency.

---

## 🔑 11. Demo Credentials (1-Click in UI)
The web application includes a 1-click **Demo Switcher** on the top navigation bar and login page:
- **Market Manager:** `manager@bazarcycle.bd` / `BazarCycle2026!`
- **Waste Collector:** `collector@bazarcycle.bd` / `BazarCycle2026!`
- **Platform Admin:** `admin@bazarcycle.bd` / `BazarCycle2026!`

---

## 🚀 12. Production Deployment
- See [DEPLOYMENT.md](file:///c:/BazarCycle_BD/DEPLOYMENT.md) for full instructions on Vercel, Supabase, and FastAPI hosts.
- See [SUPABASE_SETUP.md](file:///c:/BazarCycle_BD/SUPABASE_SETUP.md) for running `database/schema.sql` in Supabase SQL editor.
- See [docs/IMAGE_SOURCES.md](file:///c:/BazarCycle_BD/docs/IMAGE_SOURCES.md) for image attribution.

---

## 🔭 13. Future Scope
- **Mobile Application:** Offline-first Progressive Web App for market shed supervisors.
- **IoT Smart Bins:** Ultrasonic fill-level sensors at wholesale produce stalls.
- **Municipal Integration:** City Corporation waste dispatch coordination.
- **Demand Prediction:** Seasonal produce volume forecasting based on harvest cycles.
