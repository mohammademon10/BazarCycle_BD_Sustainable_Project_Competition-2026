# 🎬 BazarCycle BD — Complete Competition Demo Walkthrough

This document outlines the step-by-step procedure to demonstrate the full end-to-end circular workflow using actual database operations.

---

## Quick Demo Credentials
| Role | Email | Password | Pre-Assigned Entity |
| :--- | :--- | :--- | :--- |
| **Market Manager** | `manager@bazarcycle.bd` | `BazarCycle2026!` | Karwan Bazar Demo Market |
| **Waste Collector** | `collector@bazarcycle.bd` | `BazarCycle2026!` | Green Cycle Logistics |
| **Platform Admin** | `admin@bazarcycle.bd` | `BazarCycle2026!` | System Administrator |

---

## 11-Step Competition Demonstration Flow

### Step 1: Login as Market Manager
1. Navigate to `/login` or use the top navigation "Demo Switcher".
2. Click **Market Manager (Karwan Bazar)** for 1-click authentication.
3. Arrive at `/manager/dashboard`. Observe the live **Bazar Sustainability Score** and market overview.

### Step 2: Register Waste Batch
1. Click **Log Waste Batch** or navigate to `/manager/waste/create`.
2. Select:
   - **Market:** `Karwan Bazar Demo Market`
   - **Category:** `Vegetable Waste`
   - **Quantity:** `150` KG

### Step 3: Automatic Rule Engine Recommendation
Notice the real-time panel on the right updates instantly without page reload:
- **Recommended Pathway:** `Composting`
- **Estimated Resource Value:** `2,250 BDT` (150 KG × 15 BDT/KG)
- **Explanation:** *"Vegetable waste is rich in nitrogen and organic moisture; it can be directly redirected into decentralized aerobic composting..."*
- **Notice:** Clearly marked disclaimer on project estimates.

### Step 4: Request Pickup
1. Leave the **Immediately Request Pickup** checkbox checked (or click **Register Waste & Request Pickup**).
2. The batch is saved in the database with status `AVAILABLE` and a linked `pickup_requests` record is created.

### Step 5: Switch to Collector
1. Click the **Demo Switcher** in the top navigation bar.
2. Select **Waste Collector (Salam Miah)**.
3. Automatically redirected to `/collector/dashboard`.

### Step 6: Open Available Pickups
1. Click **Available Pickups** in the navigation or on the dashboard.
2. Observe the newly created **150 KG Vegetable Waste** request from Karwan Bazar Demo Market.

### Step 7: Accept Pickup
1. Click **Accept Pickup Request**.
2. Status transitions atomically to `ACCEPTED`.
3. Notice that if another collector views this request, it is no longer available. Concurrency tests guarantee two collectors cannot accept the same pickup.

### Step 8: Mark as Collected
1. Navigate to `/collector/pickups` (Active Pickups In-Transit).
2. Find the Karwan Bazar 150 KG batch.
3. Click **Mark as Collected**.
4. Status transitions to `COLLECTED`.

### Step 9: Automatic Impact Record Generation
1. In the backend database, an `ImpactRecord` is automatically instantiated:
   - `quantity_recovered_kg`: 150.0 KG
   - `quantity_composted_kg`: 150.0 KG
   - `estimated_value`: 2,250.0 BDT
   - `co2_impact_estimate`: 67.5 KG avoided CO₂e

### Step 10: Return to Market Manager Dashboard
1. Use the **Demo Switcher** to switch back to **Market Manager**.
2. Notice:
   - Recovered Tonnage updated by +150 KG.
   - Resource Value updated.
   - **Bazar Sustainability Score** has dynamically recalculated based on live data!

### Step 11: Inspect Public Impact Dashboard
1. Click **Public Impact** in the top navigation bar (`/impact`).
2. Verify:
   - Overall platform recovery tonnage updated.
   - Avoided CO₂ metric updated (clearly marked *Project Estimate*).
   - Chart.js graphs updated with the new recovery volume.
   - Karwan Bazar's rank on the leaderboard reflects the new score.
