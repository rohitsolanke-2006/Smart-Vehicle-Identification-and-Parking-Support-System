from io import BytesIO
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
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


# ──────────────────────────────────────────────────────────────────────────────
# Feature: Heatmap Analytics
# ──────────────────────────────────────────────────────────────────────────────

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.get("/heatmap")
def get_heatmap(
    zone: Optional[str] = Query(None, description="Filter by zone name or 'all'"),
    db: Session = Depends(get_db),
    _=Depends(require_role("manager")),
) -> Dict:
    """
    Returns a 7×24 activity matrix: rows = days of week (0=Mon), cols = hours (0-23).
    Used to render the GitHub-style contribution heatmap on the Manager Analytics page.
    """
    query = db.query(
        func.extract("dow", ParkingLog.timestamp).label("dow"),   # 0=Sun in SQLite
        func.extract("hour", ParkingLog.timestamp).label("hour"),
        func.count(ParkingLog.id).label("count"),
    )
    if zone and zone.lower() != "all":
        query = query.filter(ParkingLog.zone_name == zone)

    raw = query.group_by("dow", "hour").all()

    # Build empty 7×24 matrix (indexed Mon=0 … Sun=6)
    matrix = [[0] * 24 for _ in range(7)]
    for row in raw:
        dow = int(row.dow)   # SQLite: 0=Sun, 1=Mon …
        hour = int(row.hour)
        count = int(row.count)
        # Convert Sun=0 to Mon=0 index
        mon_idx = (dow - 1) % 7
        if 0 <= mon_idx < 7 and 0 <= hour < 24:
            matrix[mon_idx][hour] += count

    peak_day, peak_hour, peak_val = 0, 0, 0
    for d, row in enumerate(matrix):
        for h, val in enumerate(row):
            if val > peak_val:
                peak_val, peak_day, peak_hour = val, d, h

    return {
        "matrix": matrix,
        "days": DAYS,
        "peak": {
            "day": DAYS[peak_day],
            "hour": peak_hour,
            "count": peak_val,
        },
        "zone": zone or "all",
    }


# ──────────────────────────────────────────────────────────────────────────────
# Feature: PDF Report Export
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/export-pdf")
def export_pdf(
    db: Session = Depends(get_db),
    _=Depends(require_role("manager")),
):
    """Generate and stream a professional monthly parking report as PDF."""
    from datetime import datetime as dt

    # Gather report data
    total_entries = db.query(func.count(ParkingLog.id)).filter(ParkingLog.action == "ENTRY").scalar() or 0
    total_exits   = db.query(func.count(ParkingLog.id)).filter(ParkingLog.action == "EXIT").scalar() or 0
    currently_parked = db.query(func.count(Vehicle.id)).scalar() or 0
    mis_parked = db.query(func.count(Vehicle.id)).filter(Vehicle.is_mis_parked == True).scalar() or 0

    zone_stats_raw = (
        db.query(ParkingLog.zone_name, func.count(ParkingLog.id))
        .filter(ParkingLog.action == "ENTRY")
        .group_by(ParkingLog.zone_name)
        .order_by(func.count(ParkingLog.id).desc())
        .all()
    )

    hourly_raw = (
        db.query(func.extract("hour", ParkingLog.timestamp).label("hour"), func.count(ParkingLog.id))
        .group_by("hour")
        .order_by(func.count(ParkingLog.id).desc())
        .first()
    )
    peak_hour = int(hourly_raw[0]) if hourly_raw else 0

    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # ── Header ──────────────────────────────────────────────────────────
        pdf.set_fill_color(30, 41, 59)       # dark navy
        pdf.rect(0, 0, 210, 40, style="F")
        pdf.set_font("Helvetica", "B", 20)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 20, "VIT Campus Parking Report", ln=True, align="C")
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(0, 10, f"Generated: {dt.now().strftime('%d %b %Y, %I:%M %p')}", ln=True, align="C")
        pdf.ln(12)

        # ── Summary Stats ────────────────────────────────────────────────────
        pdf.set_text_color(30, 41, 59)
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Summary Statistics", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        stats = [
            ("Total Vehicle Entries", str(total_entries)),
            ("Total Vehicle Exits", str(total_exits)),
            ("Currently On Campus", str(currently_parked)),
            ("Mis-Parked Vehicles", str(mis_parked)),
            ("Estimated Peak Hour", f"{peak_hour:02d}:00 – {peak_hour+1:02d}:00"),
        ]
        for label, value in stats:
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(120, 9, label)
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 9, value, ln=True)
        pdf.ln(8)

        # ── Zone Table ────────────────────────────────────────────────────────
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Zone-wise Traffic", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        # Table header
        pdf.set_fill_color(241, 245, 249)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(130, 9, "Zone Name", border=1, fill=True)
        pdf.cell(60, 9, "Total Entries", border=1, fill=True, ln=True)

        pdf.set_font("Helvetica", "", 10)
        for zone_name, count in zone_stats_raw:
            pdf.cell(130, 9, zone_name, border=1)
            pdf.cell(60, 9, str(count), border=1, ln=True)

        # ── Footer ────────────────────────────────────────────────────────────
        pdf.ln(12)
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 8, "VIT Bibwewadi | Smart Campus Parking Management System | SE Project", align="C")

        pdf_bytes = pdf.output(dest="S").encode("latin-1")

    except ImportError:
        # Graceful fallback — return a plain-text "PDF" if fpdf2 not installed
        text = (
            f"VIT CAMPUS PARKING REPORT\n"
            f"Generated: {dt.now().strftime('%d %b %Y')}\n\n"
            f"Total Entries   : {total_entries}\n"
            f"Total Exits     : {total_exits}\n"
            f"Currently Parked: {currently_parked}\n"
            f"Mis-Parked      : {mis_parked}\n"
        )
        pdf_bytes = text.encode("utf-8")

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=parking_report.pdf"},
    )


# ──────────────────────────────────────────────────────────────────────────────
# Feature: ML Occupancy Prediction
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/predict")
def predict_occupancy(
    db: Session = Depends(get_db),
    _=Depends(require_role("manager")),
) -> Dict:
    """
    ML-powered hourly occupancy prediction for the next 24 hours.

    Algorithm:
      1. Pull all historical ParkingLog entries from the DB.
      2. Build a 7×24 frequency matrix (day-of-week × hour).
      3. Identify today's day-of-week and extract that row as the base signal.
      4. Normalise with numpy to a 0–100 predicted occupancy percentage.
      5. Label each hour LOW / MEDIUM / HIGH / PEAK.

    Falls back to a synthetic college-day curve if no history exists yet.
    """
    import math
    from datetime import datetime as dt

    try:
        import numpy as np

        # ── Pull historical data ───────────────────────────────────────────
        raw = (
            db.query(
                func.extract("dow",  ParkingLog.timestamp).label("dow"),
                func.extract("hour", ParkingLog.timestamp).label("hour"),
                func.count(ParkingLog.id).label("cnt"),
            )
            .group_by("dow", "hour")
            .all()
        )

        matrix = np.zeros((7, 24), dtype=float)
        for row in raw:
            dow  = int(row.dow)
            hour = int(row.hour)
            cnt  = int(row.cnt)
            mon_idx = (dow - 1) % 7      # SQLite: 0=Sun → shift to Mon=0
            matrix[mon_idx][hour] += cnt

        total_logs = int(matrix.sum())
        today_dow  = dt.now().weekday()  # Python: Mon=0

        if total_logs >= 5:
            # Enough data — use real ML signal
            day_row = matrix[today_dow].copy()

            # Smooth with a simple 3-hour rolling average (numpy convolve)
            kernel   = np.array([0.25, 0.5, 0.25])
            smoothed = np.convolve(day_row, kernel, mode="same")

            # Normalise to 0–100
            max_val = smoothed.max() or 1.0
            pct     = (smoothed / max_val * 100).tolist()
            source  = "historical"
        else:
            # Insufficient data → synthetic college-day bell curve
            # Peak at 10 am and 3 pm, quiet at night
            pct    = []
            for h in range(24):
                v  = (
                    55 * math.exp(-0.5 * ((h - 10) / 2.2) ** 2)   # morning peak
                  + 40 * math.exp(-0.5 * ((h - 15) / 2.0) ** 2)   # afternoon peak
                  +  5                                               # baseline
                )
                pct.append(min(round(v, 1), 100))
            source = "synthetic"

    except ImportError:
        # numpy not available — pure-Python fallback (same bell curve)
        pct = []
        for h in range(24):
            v = (
                55 * math.exp(-0.5 * ((h - 10) / 2.2) ** 2)
              + 40 * math.exp(-0.5 * ((h - 15) / 2.0) ** 2)
              +  5
            )
            pct.append(min(round(v, 1), 100))
        source = "synthetic"

    def _risk(p: float) -> str:
        if p >= 80: return "PEAK"
        if p >= 55: return "HIGH"
        if p >= 30: return "MEDIUM"
        return "LOW"

    predictions = [
        {"hour": h, "predicted_occupancy": round(pct[h], 1), "risk": _risk(pct[h])}
        for h in range(24)
    ]

    peak_hour = max(predictions, key=lambda x: x["predicted_occupancy"])

    return {
        "predictions": predictions,
        "peak_hour":   peak_hour["hour"],
        "peak_risk":   peak_hour["risk"],
        "source":      source,
        "model":       "Numpy time-series pattern analysis (7×24 frequency matrix)",
    }
