from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_zone import ParkingZone
from app.schemas.parking_zone import ParkingZoneCreate, ParkingZoneResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/zones", tags=["Parking Zones"])


@router.get("/", response_model=List[ParkingZoneResponse])
def get_all_zones(db: Session = Depends(get_db)):
    """Return all parking zones with live occupancy data (public)."""
    zones = db.query(ParkingZone).filter(ParkingZone.is_active == True).all()
    return [
        ParkingZoneResponse(
            id=z.id,
            zone_name=z.zone_name,
            capacity=z.capacity,
            occupied=z.occupied,
            is_active=z.is_active,
            free_space=z.free_space,
            occupancy_percent=z.occupancy_percent,
            status=z.status,
        )
        for z in zones
    ]


@router.get("/{zone_id}", response_model=ParkingZoneResponse)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    """Return a single parking zone by ID."""
    zone = db.query(ParkingZone).filter(ParkingZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return ParkingZoneResponse(
        id=zone.id,
        zone_name=zone.zone_name,
        capacity=zone.capacity,
        occupied=zone.occupied,
        is_active=zone.is_active,
        free_space=zone.free_space,
        occupancy_percent=zone.occupancy_percent,
        status=zone.status,
    )


@router.post("/", response_model=ParkingZoneResponse, status_code=201)
def create_zone(
    payload: ParkingZoneCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Create a new parking zone (admin)."""
    existing = (
        db.query(ParkingZone)
        .filter(ParkingZone.zone_name == payload.zone_name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Zone already exists")

    zone = ParkingZone(
        zone_name=payload.zone_name,
        capacity=payload.capacity,
        is_active=payload.is_active,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return ParkingZoneResponse(
        id=zone.id,
        zone_name=zone.zone_name,
        capacity=zone.capacity,
        occupied=zone.occupied,
        is_active=zone.is_active,
        free_space=zone.free_space,
        occupancy_percent=zone.occupancy_percent,
        status=zone.status,
    )
