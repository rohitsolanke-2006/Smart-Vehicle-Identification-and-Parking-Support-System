from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserResponse,
)
from app.services.auth_service import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (student / guard / manager)."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        student_id=payload.student_id,
        vehicle_reg=payload.vehicle_reg,
        employee_id=payload.employee_id,
    )
    db.add(new_user)
    db.commit()
from pydantic import BaseModel

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate a user and return a JWT token.
    OAuth2 compatible token login, accepts username (email) and password as form data.
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    print(f"DEBUG LOGIN - Email: '{credentials.email}' Password: '{credentials.password}' - Found User: {user is not None}")
    if user:
        print(f"DEBUG HASH - DB: '{user.password_hash}' Match: {verify_password(credentials.password, user.password_hash)}")
        
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
