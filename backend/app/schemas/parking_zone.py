from typing import Optional

from pydantic import BaseModel


class ParkingZoneCreate(BaseModel):
    zone_name: str
    capacity: int
    is_active: bool = True


class ParkingZoneResponse(BaseModel):
    id: int
    zone_name: str
    capacity: int
    occupied: int
    is_active: bool
    free_space: int
    occupancy_percent: float
    status: str  # "GREEN" | "YELLOW" | "RED"

    class Config:
        from_attributes = True
