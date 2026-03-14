"""Virtual Queue — DB model.

When a zone is FULL a student may join a queue.  When any vehicle exits
the zone the oldest WAITING entry is promoted to NOTIFIED.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_email: str = Column(String(255), nullable=False, index=True)
    zone_name: str = Column(String(100), nullable=False, index=True)
    status: str = Column(String(20), nullable=False, default="WAITING")
    # WAITING → NOTIFIED → EXPIRED
    created_at: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    notified_at: datetime = Column(DateTime, nullable=True)
