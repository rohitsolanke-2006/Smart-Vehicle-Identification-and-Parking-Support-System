from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VehicleEntry(BaseModel):
    reg_number: str
    zone_name: str


class VehicleExit(BaseModel):
    reg_number: str


class VehicleResponse(BaseModel):
    id: int
    reg_number: str
    zone_name: str
    entry_time: datetime
    is_mis_parked: bool

    class Config:
        from_attributes = True


class VehicleSearchResponse(BaseModel):
    reg_number: str
    zone_name: str
    entry_time: datetime
    is_mis_parked: bool
    duration_minutes: Optional[float] = None

    class Config:
        from_attributes = True
