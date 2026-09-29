from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SustainabilityScoreDetail(BaseModel):
    market_id: str
    market_name: Optional[str] = None
    segregation_score: float
    recovery_score: float
    recycling_score: float
    collection_score: float
    total_score: float
    score_label: str
    weights: Dict[str, str]
    metrics_summary: Optional[Dict[str, Any]] = None
    disclaimer: str

class ChartDataset(BaseModel):
    labels: List[str]
    data: List[float]
    backgroundColor: Optional[List[str]] = None
    borderColor: Optional[List[str]] = None

class DashboardMetricsResponse(BaseModel):
    total_waste_registered_kg: float
    total_waste_recovered_kg: float
    total_waste_recycled_kg: float
    total_waste_composted_kg: float
    estimated_resource_value_bdt: float
    pickup_completion_rate: float
    sustainability_score: Optional[float] = None
    sustainability_label: Optional[str] = None
    recent_waste_count: int
    pending_pickups_count: int
    
    # 4 Required Chart Datasets
    chart_waste_by_category: Dict[str, Any]
    chart_monthly_waste: Dict[str, Any]
    chart_recovery_trend: Dict[str, Any]
    chart_resource_pathway: Dict[str, Any]
