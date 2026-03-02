from sqlalchemy import Boolean, Column, Integer, String

from app.database import Base


class ParkingZone(Base):
    """Represents a campus parking area with live occupancy tracking."""

    __tablename__ = "parking_zones"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_name: str = Column(String(100), unique=True, nullable=False)
    capacity: int = Column(Integer, nullable=False)
    occupied: int = Column(Integer, nullable=False, default=0)
    is_active: bool = Column(Boolean, nullable=False, default=True)

    # ---------- Computed helpers ----------

    @property
    def free_space(self) -> int:
        return self.capacity - self.occupied

    @property
    def occupancy_percent(self) -> float:
        if self.capacity == 0:
            return 0.0
        return round((self.occupied / self.capacity) * 100, 1)

    @property
    def status(self) -> str:
        pct = self.occupancy_percent
        if pct < 60:
            return "GREEN"
        elif pct <= 90:
            return "YELLOW"
        return "RED"
