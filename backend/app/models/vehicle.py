from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class Vehicle(Base):
    """Active vehicle record — exists only while vehicle is on campus."""

    __tablename__ = "vehicles"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_number: str = Column(String(20), unique=True, nullable=False, index=True)
    zone_name: str = Column(String(100), nullable=False)
    entry_time: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_mis_parked: bool = Column(Boolean, nullable=False, default=False)
