import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, index=True) # ADMIN, MARKET_MANAGER, COLLECTOR
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    managed_markets = relationship("Market", back_populates="manager", foreign_keys="Market.manager_id")
    pickups = relationship("PickupRequest", back_populates="collector", foreign_keys="PickupRequest.collector_id")
    waste_records_logged = relationship("WasteRecord", back_populates="creator", foreign_keys="WasteRecord.created_by")
