from typing import Optional

from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "student", "guard", "manager"
    student_id: Optional[str] = None
    guard_id: Optional[str] = None
    shift: Optional[str] = None
    manager_id: Optional[str] = None
    department: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    student_id: Optional[str] = None
    guard_id: Optional[str] = None
    shift: Optional[str] = None
    manager_id: Optional[str] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
