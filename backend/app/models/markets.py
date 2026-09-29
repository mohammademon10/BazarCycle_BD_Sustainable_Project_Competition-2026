import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class Market(Base):
    __tablename__ = "markets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    area = Column(String(100), nullable=False)
    manager_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="ACTIVE") # ACTIVE, INACTIVE
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    manager = relationship("Profile", back_populates="managed_markets", foreign_keys=[manager_id])
    waste_records = relationship("WasteRecord", back_populates="market", cascade="all, delete-orphan")
    pickup_requests = relationship("PickupRequest", back_populates="market", cascade="all, delete-orphan")
    impact_records = relationship("ImpactRecord", back_populates="market", cascade="all, delete-orphan")
    sustainability_scores = relationship("SustainabilityScore", back_populates="market", cascade="all, delete-orphan")
