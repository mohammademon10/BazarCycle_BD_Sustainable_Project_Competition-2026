"""
BazarCycle BD — Bazar Sustainability Score Service
Calculates project-defined sustainability score from actual database records.
Weights:
- Waste Segregation: 25%
- Waste Recovery: 30%
- Recycling: 20%
- Collection Efficiency: 25%
Total: 0-100
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.waste import WasteRecord, WasteCategory
from app.models.pickup import PickupRequest
from app.models.impact import ImpactRecord
from app.models.sustainability import SustainabilityScore

def calculate_market_sustainability_score(db: Session, market_id: str) -> Dict[str, Any]:
    """Calculate the 4-component sustainability score based on live market data."""
    
    # 1. Total waste records for this market
    waste_records = db.query(WasteRecord).filter(WasteRecord.market_id == market_id).all()
    total_waste_kg = sum(float(r.quantity_kg) for r in waste_records)
    
    if total_waste_kg == 0:
        # Default baseline when no waste is recorded yet
        return {
            "market_id": market_id,
            "segregation_score": 0.0,
            "recovery_score": 0.0,
            "recycling_score": 0.0,
            "collection_score": 0.0,
            "total_score": 0.0,
            "score_label": "Needs Improvement",
            "weights": {
                "segregation": "25%",
                "recovery": "30%",
                "recycling": "20%",
                "collection": "25%"
            },
            "disclaimer": "Project-defined metric for demonstration; not an official environmental certification."
        }

    # Component 1: Waste Segregation (25%)
    # Ratio of non-'other' / categorized waste to total waste
    segregated_kg = sum(
        float(r.quantity_kg) for r in waste_records 
        if r.category and r.category.name.strip().lower() != "other"
    )
    segregation_ratio = segregated_kg / total_waste_kg if total_waste_kg > 0 else 0
    segregation_score = round(segregation_ratio * 100.0, 2)

    # Component 2: Waste Recovery (30%)
    # Ratio of collected/recovered waste to total registered waste
    recovered_kg = sum(
        float(r.quantity_kg) for r in waste_records 
        if r.status == "COLLECTED"
    )
    recovery_ratio = recovered_kg / total_waste_kg if total_waste_kg > 0 else 0
    recovery_score = round(recovery_ratio * 100.0, 2)

    # Component 3: Recycling & Composting (20%)
    # Ratio of collected waste that goes into recycling or composting pathways
    recycled_or_composted_kg = sum(
        float(r.quantity_kg) for r in waste_records 
        if r.status == "COLLECTED" and (
            r.category and (r.category.recyclable or r.category.organic)
        )
    )
    recycling_ratio = recycled_or_composted_kg / total_waste_kg if total_waste_kg > 0 else 0
    recycling_score = round(recycling_ratio * 100.0, 2)

    # Component 4: Collection Efficiency (25%)
    # Ratio of collected pickups to all requested pickups
    pickups = db.query(PickupRequest).filter(PickupRequest.market_id == market_id).all()
    total_pickups = len(pickups)
    collected_pickups = len([p for p in pickups if p.status == "COLLECTED"])
    
    if total_pickups > 0:
        collection_ratio = collected_pickups / total_pickups
    else:
        # If no pickups were ever requested, 0 efficiency
        collection_ratio = 0.0
    collection_score = round(collection_ratio * 100.0, 2)

    # Weighted Total Score
    total_score = round(
        (segregation_score * 0.25) +
        (recovery_score * 0.30) +
        (recycling_score * 0.20) +
        (collection_score * 0.25),
        2
    )

    # Determine qualitative label
    if total_score >= 80:
        score_label = "Excellent"
    elif total_score >= 60:
        score_label = "Good"
    elif total_score >= 40:
        score_label = "Developing"
    else:
        score_label = "Needs Improvement"

    # Persist or update latest score in database
    existing_score = db.query(SustainabilityScore).filter(
        SustainabilityScore.market_id == market_id
    ).order_by(SustainabilityScore.calculated_at.desc()).first()

    if existing_score:
        existing_score.segregation_score = segregation_score
        existing_score.recovery_score = recovery_score
        existing_score.recycling_score = recycling_score
        existing_score.collection_score = collection_score
        existing_score.total_score = total_score
        existing_score.score_label = score_label
    else:
        new_score = SustainabilityScore(
            market_id=market_id,
            segregation_score=segregation_score,
            recovery_score=recovery_score,
            recycling_score=recycling_score,
            collection_score=collection_score,
            total_score=total_score,
            score_label=score_label
        )
        db.add(new_score)
    
    db.commit()

    return {
        "market_id": market_id,
        "segregation_score": segregation_score,
        "recovery_score": recovery_score,
        "recycling_score": recycling_score,
        "collection_score": collection_score,
        "total_score": total_score,
        "score_label": score_label,
        "weights": {
            "segregation": "25%",
            "recovery": "30%",
            "recycling": "20%",
            "collection": "25%"
        },
        "metrics_summary": {
            "total_waste_kg": total_waste_kg,
            "recovered_kg": recovered_kg,
            "segregated_kg": segregated_kg,
            "total_pickups": total_pickups,
            "collected_pickups": collected_pickups
        },
        "disclaimer": "Project-defined metric for demonstration; not an official environmental certification."
    }
