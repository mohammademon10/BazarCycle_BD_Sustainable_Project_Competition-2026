import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    waste_record_id = Column(String(36), ForeignKey("waste_records.id", ondelete="CASCADE"), unique=True, nullable=False)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    collector_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(50), default="AVAILABLE", nullable=False, index=True) # AVAILABLE, ACCEPTED, COLLECTED, CANCELLED
    requested_at = Column(DateTime, default=get_utc_now)
    accepted_at = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    waste_record = relationship("WasteRecord", back_populates="pickup_request")
    market = relationship("Market", back_populates="pickup_requests")
    collector = relationship("Profile", back_populates="pickups", foreign_keys=[collector_id])
