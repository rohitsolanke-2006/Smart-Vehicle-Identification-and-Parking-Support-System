"""Pydantic schemas for the Virtual Queue feature."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class QueueJoinRequest(BaseModel):
    zone_name: str


class QueueEntryOut(BaseModel):
    id: int
    student_email: str
    zone_name: str
    status: str
    created_at: datetime
    notified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QueueStatusResponse(BaseModel):
    in_queue: bool
    zone_name: Optional[str] = None
    status: Optional[str] = None
    position: Optional[int] = None   # how many people ahead
    message: str
