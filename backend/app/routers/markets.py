from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.markets import Market
from app.models.profiles import Profile
from app.schemas.market import MarketCreate, MarketUpdate, MarketResponse
from app.core.deps import get_current_user, require_admin, require_market_manager

router = APIRouter(prefix="/markets", tags=["Markets"])

@router.get("", response_model=List[MarketResponse])
def list_markets(
    area: Optional[str] = None,
    status_filter: Optional[str] = "ACTIVE",
    db: Session = Depends(get_db)
):
    """List all markets, with optional filtering."""
    query = db.query(Market)
    if area:
        query = query.filter(Market.area.ilike(f"%{area}%"))
    if status_filter:
        query = query.filter(Market.status == status_filter.upper())
    
    markets = query.order_by(Market.name.asc()).all()
    
    results = []
    for m in markets:
        res = MarketResponse(
            id=m.id,
            name=m.name,
            location=m.location,
            area=m.area,
            manager_id=m.manager_id,
            manager_name=m.manager.name if m.manager else None,
            contact_phone=m.contact_phone,
            status=m.status,
            created_at=m.created_at,
            updated_at=m.updated_at
        )
        results.append(res)
    return results

@router.get("/my/market", response_model=Optional[MarketResponse])
def get_my_market(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the market assigned to the logged-in Market Manager."""
    market = db.query(Market).filter(Market.manager_id == current_user.id).first()
    if not market:
        # Fallback: if user is admin, return the first market
        if current_user.role == "ADMIN":
            market = db.query(Market).first()
        if not market:
            return None
    
    return MarketResponse(
        id=market.id,
        name=market.name,
        location=market.location,
        area=market.area,
        manager_id=market.manager_id,
        manager_name=market.manager.name if market.manager else None,
        contact_phone=market.contact_phone,
        status=market.status,
        created_at=market.created_at,
        updated_at=market.updated_at
    )

@router.get("/{market_id}", response_model=MarketResponse)
def get_market(market_id: str, db: Session = Depends(get_db)):
    """Get market details by ID."""
    m = db.query(Market).filter(Market.id == market_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Market not found.")
    
    return MarketResponse(
        id=m.id,
        name=m.name,
        location=m.location,
        area=m.area,
        manager_id=m.manager_id,
        manager_name=m.manager.name if m.manager else None,
        contact_phone=m.contact_phone,
        status=m.status,
        created_at=m.created_at,
        updated_at=m.updated_at
    )

@router.post("", response_model=MarketResponse, status_code=status.HTTP_201_CREATED)
def create_market(
    market_in: MarketCreate,
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: Register a new local market."""
    if market_in.manager_id:
        manager = db.query(Profile).filter(Profile.id == market_in.manager_id).first()
        if not manager:
            raise HTTPException(status_code=400, detail="Assigned manager user not found.")

    market = Market(
        name=market_in.name.strip(),
        location=market_in.location.strip(),
        area=market_in.area.strip(),
        manager_id=market_in.manager_id,
        contact_phone=market_in.contact_phone.strip() if market_in.contact_phone else None,
        status=market_in.status.upper()
    )
    db.add(market)
    db.commit()
    db.refresh(market)
    
    return MarketResponse(
        id=market.id,
        name=market.name,
        location=market.location,
        area=market.area,
        manager_id=market.manager_id,
        manager_name=market.manager.name if market.manager else None,
        contact_phone=market.contact_phone,
        status=market.status,
        created_at=market.created_at,
        updated_at=market.updated_at
    )

@router.put("/{market_id}", response_model=MarketResponse)
def update_market(
    market_id: str,
    market_in: MarketUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin or assigned Market Manager: Update market details."""
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found.")
    
    # Check permissions
    if current_user.role != "ADMIN" and market.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this market.")

    if market_in.name is not None:
        market.name = market_in.name.strip()
    if market_in.location is not None:
        market.location = market_in.location.strip()
    if market_in.area is not None:
        market.area = market_in.area.strip()
    if market_in.contact_phone is not None:
        market.contact_phone = market_in.contact_phone.strip()
    if market_in.status is not None:
        market.status = market_in.status.upper()
    if current_user.role == "ADMIN" and market_in.manager_id is not None:
        market.manager_id = market_in.manager_id

    db.commit()
    db.refresh(market)

    return MarketResponse(
        id=market.id,
        name=market.name,
        location=market.location,
        area=market.area,
        manager_id=market.manager_id,
        manager_name=market.manager.name if market.manager else None,
        contact_phone=market.contact_phone,
        status=market.status,
        created_at=market.created_at,
        updated_at=market.updated_at
    )
