from datetime import date, datetime, timezone
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.waste import WasteCategory, WasteRecord
from app.models.markets import Market
from app.models.pickup import PickupRequest
from app.models.profiles import Profile
from app.schemas.waste import (
    WasteCategoryCreate,
    WasteCategoryResponse,
    WasteRecordCreate,
    WasteRecordResponse,
    WasteRecommendRequest,
    WasteRecommendResponse
)
from app.services.waste_recommendation_service import recommendation_engine
from app.core.deps import get_current_user, require_admin, require_market_manager

router = APIRouter(prefix="/waste", tags=["Waste Management & Recommendations"])

@router.get("/categories", response_model=List[WasteCategoryResponse])
def list_waste_categories(db: Session = Depends(get_db)):
    """List all supported waste categories."""
    categories = db.query(WasteCategory).order_by(WasteCategory.name.asc()).all()
    return [
        WasteCategoryResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            waste_type=c.waste_type,
            resource_pathway=c.resource_pathway,
            estimated_value_per_kg=float(c.estimated_value_per_kg),
            recyclable=c.recyclable,
            organic=c.organic,
            created_at=c.created_at
        )
        for c in categories
    ]

@router.post("/categories", response_model=WasteCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_waste_category(
    cat_in: WasteCategoryCreate,
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: Add a new waste category."""
    existing = db.query(WasteCategory).filter(WasteCategory.name.ilike(cat_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists.")

    cat = WasteCategory(
        name=cat_in.name.strip(),
        description=cat_in.description.strip() if cat_in.description else None,
        waste_type=cat_in.waste_type.strip(),
        resource_pathway=cat_in.resource_pathway.strip(),
        estimated_value_per_kg=Decimal(str(cat_in.estimated_value_per_kg)),
        recyclable=cat_in.recyclable,
        organic=cat_in.organic
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    return WasteCategoryResponse(
        id=cat.id,
        name=cat.name,
        description=cat.description,
        waste_type=cat.waste_type,
        resource_pathway=cat.resource_pathway,
        estimated_value_per_kg=float(cat.estimated_value_per_kg),
        recyclable=cat.recyclable,
        organic=cat.organic,
        created_at=cat.created_at
    )

@router.post("/recommend", response_model=WasteRecommendResponse)
def get_waste_recommendation(
    req: WasteRecommendRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluate deterministic rule engine for a category and quantity.
    Returns explainable recommendation, resource pathway, and estimated value in BDT.
    """
    category_name = req.category_name
    unit_rate: Optional[float] = None

    if req.category_id:
        category = db.query(WasteCategory).filter(WasteCategory.id == req.category_id).first()
        if category:
            category_name = category.name
            unit_rate = float(category.estimated_value_per_kg)

    if not category_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either category_id or category_name must be provided."
        )

    try:
        recommendation = recommendation_engine.get_recommendation(
            category_name=category_name,
            quantity_kg=req.quantity_kg,
            custom_rate_bdt=unit_rate
        )
        return WasteRecommendResponse(**recommendation)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.post("", response_model=WasteRecordResponse, status_code=status.HTTP_201_CREATED)
def create_waste_record(
    record_in: WasteRecordCreate,
    current_user: Profile = Depends(require_market_manager),
    db: Session = Depends(get_db)
):
    """
    Market Manager / Admin: Register waste batch.
    Automatically applies recommendation engine rules, calculates estimated resource value in BDT.
    """
    # Verify Market
    market = db.query(Market).filter(Market.id == record_in.market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Specified market does not exist.")

    # Authorization: Manager must manage this market, unless admin
    if current_user.role != "ADMIN" and market.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only register waste for your assigned market.")

    # Verify Category
    category = db.query(WasteCategory).filter(WasteCategory.id == record_in.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Specified waste category does not exist.")

    # Run recommendation engine
    rec = recommendation_engine.get_recommendation(
        category_name=category.name,
        quantity_kg=record_in.quantity_kg,
        custom_rate_bdt=float(category.estimated_value_per_kg)
    )

    waste_record = WasteRecord(
        market_id=market.id,
        category_id=category.id,
        quantity_kg=Decimal(str(record_in.quantity_kg)),
        description=record_in.description.strip() if record_in.description else None,
        record_date=record_in.record_date or date.today(),
        status="AVAILABLE",
        recommended_pathway=rec["recommended_pathway"],
        estimated_value=Decimal(str(rec["estimated_value"])),
        created_by=current_user.id
    )
    db.add(waste_record)
    db.commit()
    db.refresh(waste_record)

    return WasteRecordResponse(
        id=waste_record.id,
        market_id=waste_record.market_id,
        market_name=market.name,
        category_id=waste_record.category_id,
        category_name=category.name,
        quantity_kg=float(waste_record.quantity_kg),
        description=waste_record.description,
        record_date=waste_record.record_date,
        status=waste_record.status,
        recommended_pathway=waste_record.recommended_pathway,
        estimated_value=float(waste_record.estimated_value),
        created_by=waste_record.created_by,
        creator_name=current_user.name,
        created_at=waste_record.created_at,
        updated_at=waste_record.updated_at,
        has_pickup_request=False,
        pickup_status=None
    )

@router.get("", response_model=List[WasteRecordResponse])
def list_waste_records(
    market_id: Optional[str] = None,
    category_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List waste records with optional filters."""
    query = db.query(WasteRecord)
    if market_id:
        query = query.filter(WasteRecord.market_id == market_id)
    if category_id:
        query = query.filter(WasteRecord.category_id == category_id)
    if status_filter:
        query = query.filter(WasteRecord.status == status_filter.upper())

    records = query.order_by(WasteRecord.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for r in records:
        pickup = r.pickup_request
        results.append(
            WasteRecordResponse(
                id=r.id,
                market_id=r.market_id,
                market_name=r.market.name if r.market else None,
                category_id=r.category_id,
                category_name=r.category.name if r.category else None,
                quantity_kg=float(r.quantity_kg),
                description=r.description,
                record_date=r.record_date,
                status=r.status,
                recommended_pathway=r.recommended_pathway,
                estimated_value=float(r.estimated_value),
                created_by=r.created_by,
                creator_name=r.creator.name if r.creator else None,
                created_at=r.created_at,
                updated_at=r.updated_at,
                has_pickup_request=pickup is not None,
                pickup_status=pickup.status if pickup else None
            )
        )
    return results

@router.get("/{waste_id}", response_model=WasteRecordResponse)
def get_waste_record(waste_id: str, db: Session = Depends(get_db)):
    """Get waste record details by ID."""
    r = db.query(WasteRecord).filter(WasteRecord.id == waste_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Waste record not found.")

    pickup = r.pickup_request
    return WasteRecordResponse(
        id=r.id,
        market_id=r.market_id,
        market_name=r.market.name if r.market else None,
        category_id=r.category_id,
        category_name=r.category.name if r.category else None,
        quantity_kg=float(r.quantity_kg),
        description=r.description,
        record_date=r.record_date,
        status=r.status,
        recommended_pathway=r.recommended_pathway,
        estimated_value=float(r.estimated_value),
        created_by=r.created_by,
        creator_name=r.creator.name if r.creator else None,
        created_at=r.created_at,
        updated_at=r.updated_at,
        has_pickup_request=pickup is not None,
        pickup_status=pickup.status if pickup else None
    )
