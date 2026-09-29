"""
BazarCycle BD — Pickup Service
Handles lifecycle:
AVAILABLE -> ACCEPTED -> COLLECTED (or CANCELLED)
Prevents race conditions (no two collectors can accept the same pickup).
Automatically logs ImpactRecord upon collection.
"""
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.pickup import PickupRequest
from app.models.waste import WasteRecord
from app.models.impact import ImpactRecord
from app.services.waste_recommendation_service import recommendation_engine

def request_pickup_for_waste(
    db: Session,
    waste_record_id: str,
    market_id: str,
    notes: Optional[str] = None
) -> PickupRequest:
    """Create a new pickup request for an available waste record."""
    waste = db.query(WasteRecord).filter(
        WasteRecord.id == waste_record_id,
        WasteRecord.market_id == market_id
    ).first()

    if not waste:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste record not found for this market."
        )

    if waste.status != "AVAILABLE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot request pickup for waste with status '{waste.status}'."
        )

    existing_pickup = db.query(PickupRequest).filter(
        PickupRequest.waste_record_id == waste_record_id
    ).first()

    if existing_pickup:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pickup request already exists for this waste record."
        )

    pickup = PickupRequest(
        waste_record_id=waste.id,
        market_id=market_id,
        status="AVAILABLE",
        notes=notes,
        requested_at=datetime.now(timezone.utc)
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return pickup

def accept_pickup(
    db: Session,
    pickup_id: str,
    collector_id: str
) -> PickupRequest:
    """
    Accept an available pickup.
    Enforces atomic status update so no two collectors can accept simultaneously.
    """
    # Using row-level locking / filter on status='AVAILABLE' to guarantee concurrency safety
    pickup = db.query(PickupRequest).filter(
        PickupRequest.id == pickup_id
    ).with_for_update().first()

    if not pickup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pickup request not found."
        )

    if pickup.status != "AVAILABLE":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Pickup is no longer available. Current status: {pickup.status}."
        )

    # Assign collector and update status
    pickup.collector_id = collector_id
    pickup.status = "ACCEPTED"
    pickup.accepted_at = datetime.now(timezone.utc)

    # Update associated waste record status
    if pickup.waste_record:
        pickup.waste_record.status = "ACCEPTED"

    db.commit()
    db.refresh(pickup)
    return pickup

def complete_pickup_collection(
    db: Session,
    pickup_id: str,
    collector_id: str,
    collection_notes: Optional[str] = None
) -> PickupRequest:
    """
    Mark pickup as COLLECTED.
    Automatically generates ImpactRecord and updates waste status.
    """
    pickup = db.query(PickupRequest).filter(
        PickupRequest.id == pickup_id
    ).with_for_update().first()

    if not pickup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pickup request not found."
        )

    if pickup.collector_id != collector_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to complete a pickup accepted by another collector."
        )

    if pickup.status != "ACCEPTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark as collected from current status: {pickup.status}. Must be ACCEPTED."
        )

    now = datetime.now(timezone.utc)
    pickup.status = "COLLECTED"
    pickup.collected_at = now
    if collection_notes:
        pickup.notes = f"{pickup.notes or ''} | Note: {collection_notes}".strip(" |")

    waste = pickup.waste_record
    if waste:
        waste.status = "COLLECTED"
        qty = float(waste.quantity_kg)
        val = float(waste.estimated_value)

        # Classify impact quantities based on category
        cat_name = waste.category.name if waste.category else "Other"
        rec = recommendation_engine.get_recommendation(
            cat_name,
            qty,
            custom_rate_bdt=float(waste.category.estimated_value_per_kg) if waste.category else None
        )

        recycled_kg = qty if rec["recyclable"] else 0.0
        composted_kg = qty if rec["organic"] and rec["recommended_pathway"] == "Composting" else 0.0
        co2_val = rec["co2_impact_estimate"]

        # Create ImpactRecord
        impact = ImpactRecord(
            market_id=pickup.market_id,
            waste_record_id=waste.id,
            quantity_recovered_kg=Decimal(str(qty)),
            quantity_recycled_kg=Decimal(str(recycled_kg)),
            quantity_composted_kg=Decimal(str(composted_kg)),
            estimated_value=Decimal(str(val)),
            co2_impact_estimate=Decimal(str(co2_val)),
            recorded_at=now
        )
        db.add(impact)

    db.commit()
    db.refresh(pickup)
    return pickup
