from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .synthetic_data import seed_database_if_empty
from .routes import auth, projects, dashboard, alerts, analytics, analysis

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

# Seed dataset on startup
try:
    db = SessionLocal()
    seed_database_if_empty(db)
    db.close()
except Exception as e:
    print(f"[STARTUP] Seeding warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SIH26102 – AI-Powered System to Detect Anomalies, Inefficiencies and Fraud Indicators in MPLAD Scheme Implementation",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with API prefix and directly at root for convenience
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)

# Also mount directly for direct endpoints specified in prompt (e.g. POST /auth/login, GET /projects, etc.)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "active",
        "problem_statement": "SIH26102 - AI Anomaly Detection in MPLADS",
        "docs": "/docs",
        "disclaimer": "AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials."
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
