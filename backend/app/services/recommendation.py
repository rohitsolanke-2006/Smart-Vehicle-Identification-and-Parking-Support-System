from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.parking_zone import ParkingZone


def get_best_zone(db: Session) -> Optional[dict]:
    """RecommendationEngine logic — returns the zone with the most free space."""
    zones: List[ParkingZone] = (
        db.query(ParkingZone).filter(ParkingZone.is_active == True).all()
    )

    if not zones:
        return None

    best = max(zones, key=lambda z: z.free_space)

    if best.free_space <= 0:
        message = "All parking zones are full. Please wait."
    elif best.occupancy_percent > 80:
        message = "Parking almost full — limited space available."
    elif best.occupancy_percent > 50:
        message = "Limited space, hurry up!"
    else:
        message = "Plenty of space available."

    return {
        "best_zone": best.zone_name,
        "free_space": best.free_space,
        "occupancy_percent": best.occupancy_percent,
        "message": message,
        "all_zones": [
            {
                "zone_name": z.zone_name,
                "capacity": z.capacity,
                "occupied": z.occupied,
                "free_space": z.free_space,
                "occupancy_percent": z.occupancy_percent,
                "status": z.status,
            }
            for z in zones
        ],
    }
