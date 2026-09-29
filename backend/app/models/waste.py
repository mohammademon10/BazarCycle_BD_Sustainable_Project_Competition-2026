import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, DateTime, Date, Numeric, Boolean, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    waste_type = Column(String(50), nullable=False) # Organic, Recyclable, Mixed
    resource_pathway = Column(String(100), nullable=False) # Composting, Recycling, Organic Fertilizer, etc.
    estimated_value_per_kg = Column(Numeric(10, 2), default=0.00, nullable=False)
    recyclable = Column(Boolean, default=False, nullable=False)
    organic = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    records = relationship("WasteRecord", back_populates="category")


class WasteRecord(Base):
    __tablename__ = "waste_records"
    __table_args__ = (
        CheckConstraint("quantity_kg > 0", name="check_positive_quantity"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("waste_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity_kg = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    record_date = Column(Date, default=date.today, nullable=False, index=True)
    status = Column(String(50), default="AVAILABLE", nullable=False, index=True) # AVAILABLE, ACCEPTED, COLLECTED, CANCELLED
    recommended_pathway = Column(String(100), nullable=False)
    estimated_value = Column(Numeric(12, 2), default=0.00, nullable=False)
    created_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    market = relationship("Market", back_populates="waste_records")
    category = relationship("WasteCategory", back_populates="records")
    creator = relationship("Profile", back_populates="waste_records_logged", foreign_keys=[created_by])
    pickup_request = relationship("PickupRequest", back_populates="waste_record", uselist=False, cascade="all, delete-orphan")
    impact_record = relationship("ImpactRecord", back_populates="waste_record", uselist=False, cascade="all, delete-orphan")
