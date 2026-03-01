import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    PROJECT_NAME: str = "Smart Campus Parking System"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./campus_parking.db",
    )

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "480"))

    # CORS — allowed origins for frontend
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]


settings = Settings()
