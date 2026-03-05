from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_log import ParkingLog
from app.models.vehicle import Vehicle
from app.schemas.parking_log import (
    AnalyticsResponse,
    HourlyCount,
    ParkingLogResponse,
    ZoneCount,
)
from app.services.auth_service import require_role

router = APIRouter(prefix="/logs", tags=["Parking Logs"])


@router.get("/", response_model=List[ParkingLogResponse])
def get_logs(
    zone_name: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    reg_number: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _=Depends(require_role("manager")),
):
    """Retrieve parking logs with optional filters — manager only."""
    query = db.query(ParkingLog)

    if zone_name:
        query = query.filter(ParkingLog.zone_name == zone_name)
    if action:
        query = query.filter(ParkingLog.action == action.upper())
    if reg_number:
        query = query.filter(ParkingLog.reg_number.contains(reg_number))

    logs = query.order_by(ParkingLog.timestamp.desc()).offset(offset).limit(limit).all()
    return logs


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    _=Depends(require_role("manager")),
):
    """Traffic analytics — aggregated log data for manager dashboard."""
    total_entries = (
        db.query(func.count(ParkingLog.id))
        .filter(ParkingLog.action == "ENTRY")
        .scalar()
    )
    total_exits = (
        db.query(func.count(ParkingLog.id))
        .filter(ParkingLog.action == "EXIT")
        .scalar()
    )
    currently_parked = db.query(func.count(Vehicle.id)).scalar()
    mis_parked_count = (
        db.query(func.count(Vehicle.id))
        .filter(Vehicle.is_mis_parked == True)
        .scalar()
    )

    zone_stats_raw = (
        db.query(
            ParkingLog.zone_name,
            ParkingLog.action,
            func.count(ParkingLog.id),
        )
        .group_by(ParkingLog.zone_name, ParkingLog.action)
        .all()
    )
    zone_map: dict = {}
    for zone_name, action, count in zone_stats_raw:
        if zone_name not in zone_map:
            zone_map[zone_name] = {"entries": 0, "exits": 0}
        if action == "ENTRY":
            zone_map[zone_name]["entries"] = count
        else:
            zone_map[zone_name]["exits"] = count

    entries_per_zone = [
        ZoneCount(zone_name=k, entries=v["entries"], exits=v["exits"])
        for k, v in zone_map.items()
    ]

    hourly_raw = (
        db.query(
            func.extract("hour", ParkingLog.timestamp).label("hour"),
            func.count(ParkingLog.id),
        )
        .group_by("hour")
        .all()
    )
    hourly_traffic = [
        HourlyCount(hour=int(h), count=c) for h, c in hourly_raw
    ]

    return AnalyticsResponse(
        total_entries=total_entries or 0,
        total_exits=total_exits or 0,
        currently_parked=currently_parked or 0,
        mis_parked_count=mis_parked_count or 0,
        entries_per_zone=entries_per_zone,
        hourly_traffic=hourly_traffic,
    )
