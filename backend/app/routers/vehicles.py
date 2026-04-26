from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_log import ParkingLog
from app.models.parking_zone import ParkingZone
from app.models.queue_entry import QueueEntry
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.vehicle import VehicleEntry, VehicleExit, VehicleResponse, VehicleSearchResponse
from app.services.auth_service import require_role, get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

def _auto_checkout_stale(db: Session, max_minutes: int = 120):
    """Auto-vacate vehicles parked longer than 2 hours (realistic max-stay policy)."""
    threshold = datetime.utcnow() - timedelta(minutes=max_minutes)
    stale = db.query(Vehicle).filter(Vehicle.entry_time <= threshold).all()
    for v in stale:
        zone = db.query(ParkingZone).filter(ParkingZone.zone_name == v.zone_name).first()
        if zone and zone.occupied > 0:
            zone.occupied -= 1
            
        log = ParkingLog(
            zone_name=v.zone_name,
            reg_number=v.reg_number,
            action="EXIT",
            timestamp=datetime.utcnow(),
        )
        db.add(log)
        
        waiting = db.query(QueueEntry).filter(
            QueueEntry.zone_name == v.zone_name,
            QueueEntry.status == "WAITING"
        ).order_by(QueueEntry.created_at.asc()).first()
        if waiting:
            waiting.status = "NOTIFIED"
            waiting.notified_at = datetime.utcnow()
            
        db.delete(v)
    if stale:
        db.commit()

@router.post("/entry", response_model=VehicleResponse, status_code=201)
def record_entry(
    payload: VehicleEntry,
    db: Session = Depends(get_db),
    _=Depends(require_role("guard")),
):
    """Record a vehicle entering campus — guard only."""
    existing = db.query(Vehicle).filter(Vehicle.reg_number == payload.reg_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle already on campus")

    zone = (
        db.query(ParkingZone)
        .filter(ParkingZone.zone_name == payload.zone_name)
        .first()
    )
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    if zone.occupied >= zone.capacity:
        raise HTTPException(status_code=400, detail="Zone is full — no space available")

    vehicle = Vehicle(
        reg_number=payload.reg_number,
        zone_name=payload.zone_name,
        entry_time=datetime.utcnow(),
    )
    db.add(vehicle)

    zone.occupied += 1

    log = ParkingLog(
        zone_name=payload.zone_name,
        reg_number=payload.reg_number,
        action="ENTRY",
        timestamp=datetime.utcnow(),
    )
    db.add(log)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post("/exit")
def record_exit(
    payload: VehicleExit,
    db: Session = Depends(get_db),
    _=Depends(require_role("guard")),
):
    """Record a vehicle exiting campus — guard only."""
    vehicle = (
        db.query(Vehicle).filter(Vehicle.reg_number == payload.reg_number).first()
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found on campus")

    zone = (
        db.query(ParkingZone)
        .filter(ParkingZone.zone_name == vehicle.zone_name)
        .first()
    )
    if zone and zone.occupied > 0:
        zone.occupied -= 1

    log = ParkingLog(
        zone_name=vehicle.zone_name,
        reg_number=vehicle.reg_number,
        action="EXIT",
        timestamp=datetime.utcnow(),
    )
    db.add(log)

    duration = (datetime.utcnow() - vehicle.entry_time).total_seconds() / 60

    # ── Virtual Queue: notify first waiting student for this zone ──────────
    waiting = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.zone_name == vehicle.zone_name,
            QueueEntry.status == "WAITING",
        )
        .order_by(QueueEntry.created_at.asc())
        .first()
    )
    if waiting:
        waiting.status = "NOTIFIED"
        waiting.notified_at = datetime.utcnow()

    db.delete(vehicle)
    db.commit()

    return {
        "message": "Vehicle exit recorded successfully",
        "reg_number": payload.reg_number,
        "duration_minutes": round(duration, 1),
        "queue_notified": waiting.student_email if waiting else None,
    }


@router.get("/search", response_model=VehicleSearchResponse)
def search_vehicle(
    reg_number: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("guard", "manager")),
):
    """Search for a vehicle by registration number — guard / manager."""
    vehicle = (
        db.query(Vehicle).filter(Vehicle.reg_number == reg_number).first()
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found on campus")

    duration = (datetime.utcnow() - vehicle.entry_time).total_seconds() / 60
    return VehicleSearchResponse(
        reg_number=vehicle.reg_number,
        zone_name=vehicle.zone_name,
        entry_time=vehicle.entry_time,
        is_mis_parked=vehicle.is_mis_parked,
        duration_minutes=round(duration, 1),
    )


@router.get("/my", response_model=VehicleSearchResponse)
def get_my_vehicle(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the active parking session for the currently logged-in student."""
    if not current_user.vehicle_reg:
        raise HTTPException(status_code=404, detail="No vehicle registered to profile.")
        
    _auto_checkout_stale(db)
    
    vehicle = db.query(Vehicle).filter(Vehicle.reg_number == current_user.vehicle_reg).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="No active parking session found.")
        
    duration = (datetime.utcnow() - vehicle.entry_time).total_seconds() / 60
    return VehicleSearchResponse(
        reg_number=vehicle.reg_number,
        zone_name=vehicle.zone_name,
        entry_time=vehicle.entry_time,
        is_mis_parked=vehicle.is_mis_parked,
        duration_minutes=round(duration, 1),
    )


@router.post("/self-checkout")
def self_checkout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allow a student to manually release their parking spot."""
    if not current_user.vehicle_reg:
        raise HTTPException(status_code=400, detail="No vehicle registered.")
        
    vehicle = db.query(Vehicle).filter(Vehicle.reg_number == current_user.vehicle_reg).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="No active parking session found.")
        
    zone = db.query(ParkingZone).filter(ParkingZone.zone_name == vehicle.zone_name).first()
    if zone and zone.occupied > 0:
        zone.occupied -= 1
        
    log = ParkingLog(
        zone_name=vehicle.zone_name,
        reg_number=vehicle.reg_number,
        action="EXIT",
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    
    waiting = db.query(QueueEntry).filter(
        QueueEntry.zone_name == vehicle.zone_name,
        QueueEntry.status == "WAITING"
    ).order_by(QueueEntry.created_at.asc()).first()
    if waiting:
        waiting.status = "NOTIFIED"
        waiting.notified_at = datetime.utcnow()
        
    db.delete(vehicle)
    db.commit()
    return {"message": "Self-checkout successful"}


@router.patch("/{reg_number}/mispark", response_model=VehicleResponse)
def mark_mis_parked(
    reg_number: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("guard")),
):
    """Flag a vehicle as mis-parked — guard only."""
    vehicle = (
        db.query(Vehicle).filter(Vehicle.reg_number == reg_number).first()
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found on campus")

    vehicle.is_mis_parked = True
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/misparked", response_model=List[VehicleResponse])
def get_mis_parked(
    db: Session = Depends(get_db),
    _=Depends(require_role("guard", "manager")),
):
    """List all mis-parked vehicles — guard / manager."""
    vehicles = db.query(Vehicle).filter(Vehicle.is_mis_parked == True).all()
    return vehicles
