from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PickupRequestCreate(BaseModel):
    waste_record_id: str
    notes: Optional[str] = None

class PickupResponse(BaseModel):
    id: str
    waste_record_id: str
    market_id: str
    market_name: Optional[str] = None
    market_location: Optional[str] = None
    market_area: Optional[str] = None
    category_name: Optional[str] = None
    quantity_kg: float
    recommended_pathway: Optional[str] = None
    estimated_value: float
    collector_id: Optional[str] = None
    collector_name: Optional[str] = None
    status: str
    requested_at: datetime
    accepted_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PickupCollectRequest(BaseModel):
    notes: Optional[str] = None
