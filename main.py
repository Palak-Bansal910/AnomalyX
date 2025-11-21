# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

# Add project root to path to allow imports
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Now we can import using backend.* syntax
from backend.core.database import Base, engine
from backend.core.logger import logger

# Import all route modules (relative import since we're in the same package)
from .routes import telemetry, anomaly, alerts, satellites

# create tables
Base.metadata.create_all(bind=engine)
logger.info("Database tables ensured.")

app = FastAPI(title="Satellite Anomaly Detector", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
app.include_router(anomaly.router, prefix="/anomalies", tags=["anomalies"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(satellites.router, prefix="/satellites", tags=["satellites"])
@app.get("/")
def root():
    return {"message": "Satellite Anomaly Detector Backend is running"}
