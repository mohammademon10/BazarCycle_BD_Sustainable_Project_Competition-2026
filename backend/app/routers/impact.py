from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.impact import ImpactRecord
from app.models.waste import WasteRecord
from app.models.pickup import PickupRequest
from app.models.markets import Market
from app.models.profiles import Profile
from app.schemas.impact import ImpactRecordResponse, PublicImpactSummary

router = APIRouter(prefix="/impact", tags=["Impact Measurement"])

@router.get("/summary", response_model=PublicImpactSummary)
def get_public_impact_summary(db: Session = Depends(get_db)):
    """
    Public Endpoint: Get real verified platform impact metrics.
    All figures are derived strictly from database records.
    """
    # Total Waste Registered
    total_waste = db.query(func.coalesce(func.sum(WasteRecord.quantity_kg), 0.0)).scalar()
    
    # Impact records aggregations
    impact_aggregates = db.query(
        func.coalesce(func.sum(ImpactRecord.quantity_recovered_kg), 0.0).label("recovered"),
        func.coalesce(func.sum(ImpactRecord.quantity_recycled_kg), 0.0).label("recycled"),
        func.coalesce(func.sum(ImpactRecord.quantity_composted_kg), 0.0).label("composted"),
        func.coalesce(func.sum(ImpactRecord.estimated_value), 0.0).label("val"),
        func.coalesce(func.sum(ImpactRecord.co2_impact_estimate), 0.0).label("co2")
    ).first()

    total_recovered = float(impact_aggregates.recovered) if impact_aggregates else 0.0
    total_recycled = float(impact_aggregates.recycled) if impact_aggregates else 0.0
    total_composted = float(impact_aggregates.composted) if impact_aggregates else 0.0
    total_value = float(impact_aggregates.val) if impact_aggregates else 0.0
    total_co2 = float(impact_aggregates.co2) if impact_aggregates else 0.0

    # Pickup completion rate
    total_pickups = db.query(PickupRequest).count()
    collected_pickups = db.query(PickupRequest).filter(PickupRequest.status == "COLLECTED").count()
    completion_rate = round((collected_pickups / total_pickups * 100.0), 1) if total_pickups > 0 else 0.0

    active_markets = db.query(Market).filter(Market.status == "ACTIVE").count()
    active_collectors = db.query(Profile).filter(Profile.role == "COLLECTOR").count()

    return PublicImpactSummary(
        total_waste_registered_kg=round(float(total_waste), 1),
        total_waste_recovered_kg=round(total_recovered, 1),
        total_waste_recycled_kg=round(total_recycled, 1),
        total_waste_composted_kg=round(total_composted, 1),
        total_estimated_value_bdt=round(total_value, 2),
        total_co2_impact_kg=round(total_co2, 1),
        pickup_completion_rate=completion_rate,
        active_markets_count=active_markets,
        active_collectors_count=active_collectors
    )

@router.get("/records", response_model=List[ImpactRecordResponse])
def list_impact_records(
    market_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List detailed impact records generated upon successful collection."""
    query = db.query(ImpactRecord)
    if market_id:
        query = query.filter(ImpactRecord.market_id == market_id)

    records = query.order_by(ImpactRecord.recorded_at.desc()).offset(skip).limit(limit).all()

    results = []
    for r in records:
        cat_name = r.waste_record.category.name if r.waste_record and r.waste_record.category else None
        results.append(
            ImpactRecordResponse(
                id=r.id,
                market_id=r.market_id,
                market_name=r.market.name if r.market else None,
                waste_record_id=r.waste_record_id,
                category_name=cat_name,
                quantity_recovered_kg=float(r.quantity_recovered_kg),
                quantity_recycled_kg=float(r.quantity_recycled_kg),
                quantity_composted_kg=float(r.quantity_composted_kg),
                estimated_value=float(r.estimated_value),
                co2_impact_estimate=float(r.co2_impact_estimate),
                recorded_at=r.recorded_at
            )
        )
    return results
