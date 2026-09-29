import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class ImpactRecord(Base):
    __tablename__ = "impact_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    waste_record_id = Column(String(36), ForeignKey("waste_records.id", ondelete="CASCADE"), nullable=False)
    quantity_recovered_kg = Column(Numeric(10, 2), default=0.00, nullable=False)
    quantity_recycled_kg = Column(Numeric(10, 2), default=0.00, nullable=False)
    quantity_composted_kg = Column(Numeric(10, 2), default=0.00, nullable=False)
    estimated_value = Column(Numeric(12, 2), default=0.00, nullable=False)
    co2_impact_estimate = Column(Numeric(10, 2), default=0.00, nullable=False) # Project Estimate
    recorded_at = Column(DateTime, default=get_utc_now, index=True)

    # Relationships
    market = relationship("Market", back_populates="impact_records")
    waste_record = relationship("WasteRecord", back_populates="impact_record")
