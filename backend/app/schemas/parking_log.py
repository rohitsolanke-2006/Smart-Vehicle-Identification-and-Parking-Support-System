from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class ParkingLogResponse(BaseModel):
    id: int
    zone_name: str
    reg_number: str
    action: str  # "ENTRY" | "EXIT"
    timestamp: datetime

    class Config:
        from_attributes = True


class HourlyCount(BaseModel):
    hour: int
    count: int


class ZoneCount(BaseModel):
    zone_name: str
    entries: int
    exits: int


class AnalyticsResponse(BaseModel):
    total_entries: int
    total_exits: int
    currently_parked: int
    mis_parked_count: int
    entries_per_zone: List[ZoneCount]
    hourly_traffic: List[HourlyCount]
