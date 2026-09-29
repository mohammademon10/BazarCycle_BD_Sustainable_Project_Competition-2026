from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import init_db
from app.routers import (
    auth,
    markets,
    waste,
    pickups,
    impact,
    sustainability,
    dashboard
)

# Initialize database schema automatically
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Bangladesh local market waste-to-resource tracking and sustainability platform. Don't Dump It. Cycle It.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(markets.router, prefix=settings.API_PREFIX)
app.include_router(waste.router, prefix=settings.API_PREFIX)
app.include_router(pickups.router, prefix=settings.API_PREFIX)
app.include_router(impact.router, prefix=settings.API_PREFIX)
app.include_router(sustainability.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health & Status"])
def root_status():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_prefix": settings.API_PREFIX
    }

@app.get("/health", tags=["Health & Status"])
def health_check():
    return {"status": "healthy", "service": "BazarCycle BD API"}
