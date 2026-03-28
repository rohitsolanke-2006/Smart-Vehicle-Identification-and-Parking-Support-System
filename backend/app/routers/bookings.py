"""Booking router — students pre-reserve a spot; guard sees and confirms it."""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.parking_zone import ParkingZone
from app.services.auth_service import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings"])

BOOKING_TTL_HOURS = 2   # spot released if student doesn't arrive within 2 hrs


# ── Schemas ────────────────────────────────────────────────────────────────


class BookingCreate(BaseModel):
    zone_name: str
    vehicle_reg: str | None = None


class BookingResponse(BaseModel):
    id: int
    student_email: str
    student_name: str
    vehicle_reg: str | None
    zone_name: str
    status: str
    booked_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


# ── Helpers ────────────────────────────────────────────────────────────────


def _expire_stale(db: Session) -> None:
    """Mark bookings past their expiry as EXPIRED and free zone slots."""
    now = datetime.utcnow()
    stale = (
        db.query(Booking)
        .filter(Booking.status == "PENDING", Booking.expires_at <= now)
        .all()
    )
    for b in stale:
        b.status = "EXPIRED"
        zone = db.query(ParkingZone).filter(ParkingZone.zone_name == b.zone_name).first()
        if zone and zone.occupied > 0:
            zone.occupied -= 1
    if stale:
        db.commit()


# ── Routes ─────────────────────────────────────────────────────────────────


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student pre-books a spot in a zone."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can book spots.")

    _expire_stale(db)

    # No double-booking
    existing = (
        db.query(Booking)
        .filter(Booking.student_email == current_user.email, Booking.status == "PENDING")
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active booking in {existing.zone_name}. Cancel it first.",
        )

    zone = db.query(ParkingZone).filter(ParkingZone.zone_name == payload.zone_name).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found.")
    if zone.occupied >= zone.capacity:
        raise HTTPException(status_code=400, detail="Zone is full — no spots to book.")

    now = datetime.utcnow()
    booking = Booking(
        student_email=current_user.email,
        student_name=current_user.name,
        vehicle_reg=payload.vehicle_reg or current_user.vehicle_reg,
        zone_name=payload.zone_name,
        status="PENDING",
        booked_at=now,
        expires_at=now + timedelta(hours=BOOKING_TTL_HOURS),
    )
    db.add(booking)
    zone.occupied += 1   # reserve one slot immediately
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=BookingResponse | None)
def get_my_booking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current student's active (PENDING) booking, if any."""
    _expire_stale(db)
    booking = (
        db.query(Booking)
        .filter(Booking.student_email == current_user.email, Booking.status == "PENDING")
        .first()
    )
    return booking


@router.delete("/my", status_code=204)
def cancel_my_booking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel the student's active booking and release the slot."""
    _expire_stale(db)
    booking = (
        db.query(Booking)
        .filter(Booking.student_email == current_user.email, Booking.status == "PENDING")
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="No active booking to cancel.")
    booking.status = "CANCELLED"
    zone = db.query(ParkingZone).filter(ParkingZone.zone_name == booking.zone_name).first()
    if zone and zone.occupied > 0:
        zone.occupied -= 1
    db.commit()


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    _=Depends(require_role("guard", "manager")),
):
    """Guard / manager: list all PENDING bookings (expire stale first)."""
    _expire_stale(db)
    bookings = (
        db.query(Booking)
        .filter(Booking.status == "PENDING")
        .order_by(Booking.booked_at.asc())
        .all()
    )
    return bookings


@router.patch("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("guard")),
):
    """Guard confirms a booking when the student physically arrives."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Booking status is already {booking.status}.")
    booking.status = "CONFIRMED"
    db.commit()
    db.refresh(booking)
    return booking
