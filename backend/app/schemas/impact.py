from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ImpactRecordResponse(BaseModel):
    id: str
    market_id: str
    market_name: Optional[str] = None
    waste_record_id: str
    category_name: Optional[str] = None
    quantity_recovered_kg: float
    quantity_recycled_kg: float
    quantity_composted_kg: float
    estimated_value: float
    co2_impact_estimate: float
    recorded_at: datetime

    class Config:
        from_attributes = True

class PublicImpactSummary(BaseModel):
    total_waste_registered_kg: float
    total_waste_recovered_kg: float
    total_waste_recycled_kg: float
    total_waste_composted_kg: float
    total_estimated_value_bdt: float
    total_co2_impact_kg: float
    pickup_completion_rate: float
    active_markets_count: int
    active_collectors_count: int
    co2_disclaimer: str = "Project Estimate based on avoided methane and open disposal factors."
    value_disclaimer: str = "Values are project estimates for demonstration purposes and may vary by location, quality, and market conditions."
