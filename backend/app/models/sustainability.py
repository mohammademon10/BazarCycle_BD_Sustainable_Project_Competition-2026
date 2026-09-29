import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class SustainabilityScore(Base):
    __tablename__ = "sustainability_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    segregation_score = Column(Numeric(5, 2), default=0.00, nullable=False) # 25% weight
    recovery_score = Column(Numeric(5, 2), default=0.00, nullable=False)    # 30% weight
    recycling_score = Column(Numeric(5, 2), default=0.00, nullable=False)   # 20% weight
    collection_score = Column(Numeric(5, 2), default=0.00, nullable=False)  # 25% weight
    total_score = Column(Numeric(5, 2), default=0.00, nullable=False)       # 0 - 100
    score_label = Column(String(50), nullable=False) # 'Needs Improvement', 'Developing', 'Good', 'Excellent'
    calculated_at = Column(DateTime, default=get_utc_now, index=True)

    # Relationships
    market = relationship("Market", back_populates="sustainability_scores")
