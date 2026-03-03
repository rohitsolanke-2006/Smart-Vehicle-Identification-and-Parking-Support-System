from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.recommendation import get_best_zone

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])


@router.get("/")
def recommend(db: Session = Depends(get_db)):
    """Get the best parking zone recommendation (public endpoint for students)."""
    result = get_best_zone(db)
    if result is None:
        return {"message": "No active parking zones available.", "best_zone": None}
    return result
