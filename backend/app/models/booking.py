from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class Booking(Base):
    """Spot pre-booking made by a student via the app.

    Lifecycle:
        PENDING  → student reserved a spot; zone.occupied is incremented.
        CONFIRMED→ guard recorded the vehicle ENTRY — booking is honoured.
        EXPIRED  → student never showed up within 2 hrs; spot released.
        CANCELLED→ student cancelled before expiry.
    """

    __tablename__ = "bookings"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_email: str = Column(String(150), nullable=False, index=True)
    student_name: str = Column(String(100), nullable=False)
    vehicle_reg: str = Column(String(30), nullable=True)   # optional plate
    zone_name: str = Column(String(100), nullable=False, index=True)
    status: str = Column(String(20), nullable=False, default="PENDING")
    booked_at: datetime = Column(DateTime, default=datetime.utcnow)
    expires_at: datetime = Column(DateTime, nullable=False)   # booked_at + 2 hrs
