from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.waste import WasteRecord, WasteCategory
from app.models.pickup import PickupRequest
from app.models.impact import ImpactRecord
from app.models.markets import Market
from app.models.profiles import Profile
from app.models.sustainability import SustainabilityScore
from app.schemas.dashboard import DashboardMetricsResponse
from app.services.sustainability_score_service import calculate_market_sustainability_score
from app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboards & Analytics"])

@router.get("/stats", response_model=DashboardMetricsResponse)
def get_dashboard_stats(
    market_id: Optional[str] = None,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate unified dashboard metrics and 4 Chart.js datasets.
    Can be scoped to a single market (for Market Manager) or all markets (for Admin/Collector).
    """
    # Context scoping: If market manager, default to their market
    target_market_id = market_id
    if current_user.role == "MARKET_MANAGER" and not target_market_id:
        my_market = db.query(Market).filter(Market.manager_id == current_user.id).first()
        if my_market:
            target_market_id = my_market.id

    # Base query filters
    waste_q = db.query(WasteRecord)
    pickup_q = db.query(PickupRequest)
    impact_q = db.query(ImpactRecord)

    if target_market_id:
        waste_q = waste_q.filter(WasteRecord.market_id == target_market_id)
        pickup_q = pickup_q.filter(PickupRequest.market_id == target_market_id)
        impact_q = impact_q.filter(ImpactRecord.market_id == target_market_id)

    # If collector, scope pickups and impact to their actions
    if current_user.role == "COLLECTOR":
        pickup_q = pickup_q.filter(PickupRequest.collector_id == current_user.id)
        # collectors get impact records for pickups they collected
        collector_waste_ids = [
            p.waste_record_id for p in db.query(PickupRequest).filter(
                PickupRequest.collector_id == current_user.id,
                PickupRequest.status == "COLLECTED"
            ).all()
        ]
        impact_q = impact_q.filter(ImpactRecord.waste_record_id.in_(collector_waste_ids)) if collector_waste_ids else db.query(ImpactRecord).filter(ImpactRecord.id == "none")

    all_waste = waste_q.all()
    all_pickups = pickup_q.all()
    all_impact = impact_q.all()

    # Core Metrics
    total_waste_registered_kg = round(sum(float(w.quantity_kg) for w in all_waste), 1)
    total_waste_recovered_kg = round(sum(float(i.quantity_recovered_kg) for i in all_impact), 1)
    total_waste_recycled_kg = round(sum(float(i.quantity_recycled_kg) for i in all_impact), 1)
    total_waste_composted_kg = round(sum(float(i.quantity_composted_kg) for i in all_impact), 1)
    estimated_resource_value_bdt = round(sum(float(w.estimated_value) for w in all_waste), 2)

    total_pickups = len(all_pickups)
    collected_pickups = len([p for p in all_pickups if p.status == "COLLECTED"])
    pickup_completion_rate = round((collected_pickups / total_pickups * 100.0), 1) if total_pickups > 0 else 0.0

    recent_waste_count = len(all_waste)
    pending_pickups_count = len([p for p in all_pickups if p.status in ["AVAILABLE", "ACCEPTED"]])

    # Sustainability Score
    score_val = None
    score_label = None
    if target_market_id:
        score_res = calculate_market_sustainability_score(db, target_market_id)
        score_val = score_res["total_score"]
        score_label = score_res["score_label"]
    else:
        # Platform average score
        scores = db.query(SustainabilityScore.total_score).all()
        if scores:
            score_val = round(sum(float(s[0]) for s in scores) / len(scores), 1)
            if score_val >= 80:
                score_label = "Excellent"
            elif score_val >= 60:
                score_label = "Good"
            elif score_val >= 40:
                score_label = "Developing"
            else:
                score_label = "Needs Improvement"

    # 1. CHART: Waste by Category
    category_totals = defaultdict(float)
    for w in all_waste:
        cat_name = w.category.name if w.category else "Unclassified"
        category_totals[cat_name] += float(w.quantity_kg)

    cat_labels = list(category_totals.keys()) if category_totals else ["Vegetable Waste", "Fruit Waste", "Plastic", "Paper/Cardboard", "Fish Waste"]
    cat_values = [round(category_totals[k], 1) for k in cat_labels] if category_totals else [0.0, 0.0, 0.0, 0.0, 0.0]

    chart_waste_by_category = {
        "labels": cat_labels,
        "datasets": [{
            "label": "Registered (KG)",
            "data": cat_values,
            "backgroundColor": [
                "#16a34a", # Forest green (Veg)
                "#f59e0b", # Amber (Fruit)
                "#0284c7", # Sky blue (Plastic)
                "#8b5cf6", # Purple (Paper)
                "#ef4444", # Red (Fish)
                "#64748b"  # Slate (Other)
            ]
        }]
    }

    # 2. CHART: Monthly Waste (Last 6 Months)
    # Group records by Year-Month
    monthly_data = defaultdict(float)
    now = datetime.now(timezone.utc)
    # Prepopulate last 6 months
    month_labels = []
    for i in range(5, -1, -1):
        # approximate month subtraction
        dt = now - timedelta(days=i * 30)
        key = dt.strftime("%b %Y")
        month_labels.append(key)
        monthly_data[key] = 0.0

    for w in all_waste:
        dt = w.record_date if hasattr(w.record_date, 'strftime') else datetime.now().date()
        key = dt.strftime("%b %Y")
        if key in monthly_data:
            monthly_data[key] += float(w.quantity_kg)

    chart_monthly_waste = {
        "labels": month_labels,
        "datasets": [{
            "label": "Waste Registered (KG)",
            "data": [round(monthly_data[m], 1) for m in month_labels],
            "backgroundColor": "#10b981",
            "borderColor": "#059669",
            "borderWidth": 2
        }]
    }

    # 3. CHART: Recovery Trend (Registered vs Recovered)
    reg_val = total_waste_registered_kg
    rec_val = total_waste_recovered_kg
    unrec_val = max(0.0, round(reg_val - rec_val, 1))

    chart_recovery_trend = {
        "labels": ["Recovered / Diverted", "Pending / Residual"],
        "datasets": [{
            "label": "KG",
            "data": [rec_val, unrec_val],
            "backgroundColor": ["#16a34a", "#e2e8f0"],
            "borderColor": ["#15803d", "#cbd5e1"],
            "borderWidth": 1
        }]
    }

    # 4. CHART: Resource Pathway Distribution
    pathway_totals = defaultdict(float)
    for w in all_waste:
        path = w.recommended_pathway or "Responsible Disposal"
        pathway_totals[path] += float(w.quantity_kg)

    pathway_labels = list(pathway_totals.keys()) if pathway_totals else ["Composting", "Recycling", "Organic Fertilizer", "Disposal"]
    pathway_values = [round(pathway_totals[p], 1) for p in pathway_labels] if pathway_totals else [0.0, 0.0, 0.0, 0.0]

    chart_resource_pathway = {
        "labels": pathway_labels,
        "datasets": [{
            "label": "Pathway Volume (KG)",
            "data": pathway_values,
            "backgroundColor": [
                "#22c55e", # Composting
                "#3b82f6", # Recycling
                "#eab308", # Fertilizer
                "#94a3b8"  # Disposal
            ]
        }]
    }

    return DashboardMetricsResponse(
        total_waste_registered_kg=total_waste_registered_kg,
        total_waste_recovered_kg=total_waste_recovered_kg,
        total_waste_recycled_kg=total_waste_recycled_kg,
        total_waste_composted_kg=total_waste_composted_kg,
        estimated_resource_value_bdt=estimated_resource_value_bdt,
        pickup_completion_rate=pickup_completion_rate,
        sustainability_score=score_val,
        sustainability_label=score_label,
        recent_waste_count=recent_waste_count,
        pending_pickups_count=pending_pickups_count,
        chart_waste_by_category=chart_waste_by_category,
        chart_monthly_waste=chart_monthly_waste,
        chart_recovery_trend=chart_recovery_trend,
        chart_resource_pathway=chart_resource_pathway
    )
