from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MarketBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=255)
    area: str = Field(..., min_length=2, max_length=100)
    contact_phone: Optional[str] = Field(None, max_length=50)
    status: str = Field("ACTIVE", description="ACTIVE or INACTIVE")

class MarketCreate(MarketBase):
    manager_id: Optional[str] = None

class MarketUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    area: Optional[str] = None
    manager_id: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[str] = None

class MarketResponse(MarketBase):
    id: str
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
