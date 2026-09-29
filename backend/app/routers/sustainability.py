from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.markets import Market
from app.models.sustainability import SustainabilityScore
from app.schemas.dashboard import SustainabilityScoreDetail
from app.services.sustainability_score_service import calculate_market_sustainability_score

router = APIRouter(prefix="/sustainability", tags=["Bazar Sustainability Score"])

@router.get("/market/{market_id}", response_model=SustainabilityScoreDetail)
def get_market_score(market_id: str, db: Session = Depends(get_db)):
    """Calculate and retrieve live sustainability score for a specific market."""
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found.")

    score_data = calculate_market_sustainability_score(db, market_id)
    score_data["market_name"] = market.name
    return SustainabilityScoreDetail(**score_data)

@router.get("/markets", response_model=List[SustainabilityScoreDetail])
def list_market_scores(db: Session = Depends(get_db)):
    """List calculated sustainability scores for all active markets."""
    markets = db.query(Market).filter(Market.status == "ACTIVE").all()
    results = []
    for m in markets:
        score_data = calculate_market_sustainability_score(db, m.id)
        score_data["market_name"] = m.name
        results.append(SustainabilityScoreDetail(**score_data))
    
    # Sort by total score descending
    results.sort(key=lambda x: x.total_score, reverse=True)
    return results
