from sqlalchemy import Column, Integer, String

from app.database import Base


class User(Base):
    """Base user model — stores students, guards, and managers in one table."""

    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name: str = Column(String(100), nullable=False)
    email: str = Column(String(150), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(255), nullable=False)
    role: str = Column(String(20), nullable=False)  # "student" | "guard" | "manager"

    # Identification
    vehicle_reg: str = Column(String(30), nullable=True)   # e.g. MH12AB1234

    # Role-specific optional fields
    student_id: str = Column(String(50), nullable=True)
    guard_id: str = Column(String(50), nullable=True)
    shift: str = Column(String(20), nullable=True)
    manager_id: str = Column(String(50), nullable=True)
    department: str = Column(String(100), nullable=True)
