from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

class WasteCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    waste_type: str = Field(..., description="Organic, Recyclable, or Mixed")
    resource_pathway: str = Field(..., description="Composting, Recycling, Organic Fertilizer, etc.")
    estimated_value_per_kg: float = Field(..., ge=0.0)
    recyclable: bool = False
    organic: bool = True

class WasteCategoryCreate(WasteCategoryBase):
    pass

class WasteCategoryResponse(WasteCategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class WasteRecordCreate(BaseModel):
    market_id: str
    category_id: str
    quantity_kg: float = Field(..., gt=0.0, description="Quantity must be strictly greater than 0")
    description: Optional[str] = None
    record_date: Optional[date] = None

    @field_validator("quantity_kg")
    def validate_positive_quantity(cls, v):
        if v <= 0:
            raise ValueError("Waste quantity must be greater than 0 KG.")
        return v

class WasteRecommendRequest(BaseModel):
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    quantity_kg: float = Field(..., gt=0.0, description="Quantity must be strictly greater than 0")

    @field_validator("quantity_kg")
    def validate_positive_quantity(cls, v):
        if v <= 0:
            raise ValueError("Waste quantity must be greater than 0 KG.")
        return v

class WasteRecommendResponse(BaseModel):
    category: str
    recommended_pathway: str
    quantity_kg: float
    unit_rate_bdt: float
    estimated_value: float
    explanation: str
    co2_impact_estimate: float
    organic: bool
    recyclable: bool
    disclaimer: str

class WasteRecordResponse(BaseModel):
    id: str
    market_id: str
    market_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    quantity_kg: float
    description: Optional[str] = None
    record_date: date
    status: str
    recommended_pathway: str
    estimated_value: float
    created_by: Optional[str] = None
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    has_pickup_request: bool = False
    pickup_status: Optional[str] = None

    class Config:
        from_attributes = True
