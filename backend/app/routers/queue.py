"""Virtual Queue router.

Students can join a waiting list when a zone is full.
The exit endpoint in vehicles.py will promote the oldest WAITING entry
to NOTIFIED automatically.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_zone import ParkingZone
from app.models.queue_entry import QueueEntry
from app.schemas.queue_entry import QueueEntryOut, QueueJoinRequest, QueueStatusResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/queue", tags=["Virtual Queue"])


@router.post("/join", response_model=QueueEntryOut, status_code=201)
def join_queue(
    payload: QueueJoinRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Student joins the waitlist for a full zone."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can join the queue")

    zone = db.query(ParkingZone).filter(ParkingZone.zone_name == payload.zone_name).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Prevent duplicate entries
    existing = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.student_email == current_user.email,
            QueueEntry.status == "WAITING",
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail=f"You are already queued for {existing.zone_name}"
        )

    entry = QueueEntry(
        student_email=current_user.email,
        zone_name=payload.zone_name,
        status="WAITING",
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/my-status", response_model=QueueStatusResponse)
def my_queue_status(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Check the current student's queue status."""
    entry = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.student_email == current_user.email,
            QueueEntry.status.in_(["WAITING", "NOTIFIED"]),
        )
        .order_by(QueueEntry.created_at.desc())
        .first()
    )

    if not entry:
        return QueueStatusResponse(
            in_queue=False, message="You are not in any queue."
        )

    if entry.status == "NOTIFIED":
        return QueueStatusResponse(
            in_queue=True,
            zone_name=entry.zone_name,
            status="NOTIFIED",
            position=0,
            message=f"🎉 A spot just opened in {entry.zone_name}! Head there now.",
        )

    # Calculate position ahead
    position = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.zone_name == entry.zone_name,
            QueueEntry.status == "WAITING",
            QueueEntry.created_at < entry.created_at,
        )
        .count()
    )

    return QueueStatusResponse(
        in_queue=True,
        zone_name=entry.zone_name,
        status="WAITING",
        position=position,
        message=f"You are #{position + 1} in queue for {entry.zone_name}.",
    )


@router.delete("/leave/{zone_name}", status_code=204)
def leave_queue(
    zone_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Remove student from the waitlist."""
    entry = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.student_email == current_user.email,
            QueueEntry.zone_name == zone_name,
            QueueEntry.status == "WAITING",
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="No active queue entry found")
    db.delete(entry)
    db.commit()
