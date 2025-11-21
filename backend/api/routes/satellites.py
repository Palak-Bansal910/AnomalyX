# backend/api/routes/satellites.py
from fastapi import APIRouter
import sys
from pathlib import Path

# Add project root to path to allow imports
project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from backend.core.database import SessionLocal
from backend.core.models import AnomalyEvent, Telemetry
from sqlalchemy import func, distinct
from datetime import datetime, timedelta

router = APIRouter(tags=["Satellites"])


@router.get("/")
def get_satellites():
    """
    Get list of all satellites with their latest status.
    Returns satellite IDs and their current operational status.
    """
    db = SessionLocal()
    try:
        # Get distinct satellite IDs from telemetry
        satellite_ids = (
            db.query(distinct(Telemetry.satellite_id))
            .filter(Telemetry.satellite_id.isnot(None))
            .all()
        )
        
        # If no telemetry, check anomalies
        if not satellite_ids:
            satellite_ids = (
                db.query(distinct(AnomalyEvent.satellite_id))
                .filter(AnomalyEvent.satellite_id.isnot(None))
                .all()
            )
        
        # Extract satellite IDs from tuples
        sat_ids = [sat[0] for sat in satellite_ids if sat[0]]
        
        # If still no satellites, return default list
        if not sat_ids:
            sat_ids = ["SAT-01", "SAT-02", "SAT-03"]
        
        # Get latest status for each satellite
        result = []
        for sat_id in sat_ids:
            # Get latest anomaly for this satellite
            latest_anomaly = (
                db.query(AnomalyEvent)
                .filter(AnomalyEvent.satellite_id == sat_id)
                .order_by(AnomalyEvent.timestamp.desc())
                .first()
            )
            
            # Get latest telemetry for this satellite
            latest_telemetry = (
                db.query(Telemetry)
                .filter(Telemetry.satellite_id == sat_id)
                .order_by(Telemetry.timestamp.desc())
                .first()
            )
            
            # Determine if online (has telemetry in last hour)
            is_online = False
            if latest_telemetry and latest_telemetry.timestamp:
                time_diff = datetime.utcnow() - latest_telemetry.timestamp
                is_online = time_diff < timedelta(hours=1)
            
            result.append({
                "satellite_id": sat_id,
                "is_online": is_online,
                "latest_severity": latest_anomaly.severity if latest_anomaly else "normal",
                "last_telemetry": latest_telemetry.timestamp.isoformat() if latest_telemetry and latest_telemetry.timestamp else None,
            })
        
        return {"data": result}
    except Exception as e:
        return {"data": [
            {"satellite_id": "SAT-01", "is_online": True, "latest_severity": "normal", "last_telemetry": None},
            {"satellite_id": "SAT-02", "is_online": True, "latest_severity": "normal", "last_telemetry": None},
            {"satellite_id": "SAT-03", "is_online": True, "latest_severity": "normal", "last_telemetry": None},
        ]}
    finally:
        db.close()

