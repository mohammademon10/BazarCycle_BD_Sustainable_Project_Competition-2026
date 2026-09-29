from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pickup import PickupRequest
from app.models.waste import WasteRecord
from app.models.profiles import Profile
from app.schemas.pickup import (
    PickupRequestCreate,
    PickupResponse,
    PickupCollectRequest
)
from app.services.pickup_service import (
    request_pickup_for_waste,
    accept_pickup,
    complete_pickup_collection
)
from app.core.deps import (
    get_current_user,
    require_admin,
    require_collector,
    require_market_manager
)

router = APIRouter(prefix="/pickups", tags=["Pickup Workflow"])

def serialize_pickup(p: PickupRequest) -> PickupResponse:
    waste = p.waste_record
    market = p.market
    collector = p.collector
    category = waste.category if waste else None

    return PickupResponse(
        id=p.id,
        waste_record_id=p.waste_record_id,
        market_id=p.market_id,
        market_name=market.name if market else None,
        market_location=market.location if market else None,
        market_area=market.area if market else None,
        category_name=category.name if category else "Uncategorized",
        quantity_kg=float(waste.quantity_kg) if waste else 0.0,
        recommended_pathway=waste.recommended_pathway if waste else None,
        estimated_value=float(waste.estimated_value) if waste else 0.0,
        collector_id=p.collector_id,
        collector_name=collector.name if collector else None,
        status=p.status,
        requested_at=p.requested_at,
        accepted_at=p.accepted_at,
        collected_at=p.collected_at,
        notes=p.notes
    )

@router.post("", response_model=PickupResponse, status_code=status.HTTP_201_CREATED)
def create_pickup_request(
    req_in: PickupRequestCreate,
    current_user: Profile = Depends(require_market_manager),
    db: Session = Depends(get_db)
):
    """Market Manager: Request pickup for a registered waste record."""
    waste = db.query(WasteRecord).filter(WasteRecord.id == req_in.waste_record_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Waste record not found.")

    pickup = request_pickup_for_waste(
        db=db,
        waste_record_id=waste.id,
        market_id=waste.market_id,
        notes=req_in.notes
    )
    return serialize_pickup(pickup)

@router.get("/available", response_model=List[PickupResponse])
def list_available_pickups(
    area: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Collector / Public: View available pickup opportunities.
    Returns all requests with status = 'AVAILABLE'.
    """
    query = db.query(PickupRequest).filter(PickupRequest.status == "AVAILABLE")
    if area:
        query = query.join(PickupRequest.market).filter(PickupRequest.market.has(area=area))

    pickups = query.order_by(PickupRequest.requested_at.desc()).all()
    return [serialize_pickup(p) for p in pickups]

@router.get("/my", response_model=List[PickupResponse])
def list_my_pickups(
    status_filter: Optional[str] = None,
    current_user: Profile = Depends(require_collector),
    db: Session = Depends(get_db)
):
    """Collector: View pickups accepted or collected by currently logged-in collector."""
    query = db.query(PickupRequest).filter(PickupRequest.collector_id == current_user.id)
    if status_filter:
        query = query.filter(PickupRequest.status == status_filter.upper())
    
    pickups = query.order_by(PickupRequest.updated_at.desc()).all()
    return [serialize_pickup(p) for p in pickups]

@router.get("", response_model=List[PickupResponse])
def list_all_pickups(
    market_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin / Manager: List all pickup records."""
    query = db.query(PickupRequest)
    if market_id:
        query = query.filter(PickupRequest.market_id == market_id)
    if status_filter:
        query = query.filter(PickupRequest.status == status_filter.upper())

    pickups = query.order_by(PickupRequest.created_at.desc()).all()
    return [serialize_pickup(p) for p in pickups]

@router.post("/{pickup_id}/accept", response_model=PickupResponse)
def accept_pickup_request(
    pickup_id: str,
    current_user: Profile = Depends(require_collector),
    db: Session = Depends(get_db)
):
    """
    Collector: Accept an available pickup request.
    Prevents race conditions; two collectors cannot accept the same pickup.
    """
    pickup = accept_pickup(db=db, pickup_id=pickup_id, collector_id=current_user.id)
    return serialize_pickup(pickup)

@router.post("/{pickup_id}/collect", response_model=PickupResponse)
def mark_pickup_collected(
    pickup_id: str,
    req_in: Optional[PickupCollectRequest] = None,
    current_user: Profile = Depends(require_collector),
    db: Session = Depends(get_db)
):
    """
    Collector: Mark accepted pickup as COLLECTED.
    Automatically generates ImpactRecord and updates waste status.
    """
    notes = req_in.notes if req_in else None
    pickup = complete_pickup_collection(
        db=db,
        pickup_id=pickup_id,
        collector_id=current_user.id,
        collection_notes=notes
    )
    return serialize_pickup(pickup)

@router.post("/{pickup_id}/cancel", response_model=PickupResponse)
def cancel_pickup_request(
    pickup_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Market Manager / Admin: Cancel pickup request."""
    pickup = db.query(PickupRequest).filter(PickupRequest.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found.")

    if pickup.status == "COLLECTED":
        raise HTTPException(status_code=400, detail="Cannot cancel a collected pickup.")

    pickup.status = "CANCELLED"
    if pickup.waste_record:
        pickup.waste_record.status = "CANCELLED"

    db.commit()
    db.refresh(pickup)
    return serialize_pickup(pickup)
