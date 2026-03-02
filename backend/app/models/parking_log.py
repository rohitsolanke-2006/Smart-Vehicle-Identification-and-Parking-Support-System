from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class ParkingLog(Base):
    """Permanent audit log of all ENTRY / EXIT events — never deleted."""

    __tablename__ = "parking_logs"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_name: str = Column(String(100), nullable=False)
    reg_number: str = Column(String(20), nullable=False, index=True)
    action: str = Column(String(10), nullable=False)  # "ENTRY" | "EXIT"
    timestamp: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
