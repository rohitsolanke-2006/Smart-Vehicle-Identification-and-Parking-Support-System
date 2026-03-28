from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, bookings, logs, queue, recommendation, vehicles, vision, zones

# ---------- Create tables ----------
Base.metadata.create_all(bind=engine)

# ---------- App ----------
app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------- CORS (frontend ↔ backend linking) ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Register routers ----------
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(zones.router, prefix=settings.API_PREFIX)
app.include_router(vehicles.router, prefix=settings.API_PREFIX)
app.include_router(logs.router, prefix=settings.API_PREFIX)
app.include_router(recommendation.router, prefix=settings.API_PREFIX)
app.include_router(vision.router, prefix=settings.API_PREFIX)
app.include_router(queue.router, prefix=settings.API_PREFIX)
app.include_router(bookings.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "running",
        "docs": "/docs",
    }
