# backend/api/routes/anomaly.py
from fastapi import APIRouter, Query
import sys
from pathlib import Path

# Add project root to path to allow imports
project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from backend.services.state import get_latest_anomalies
from backend.core.database import SessionLocal
from backend.core.models import AnomalyEvent
from sqlalchemy import func, distinct

router = APIRouter(tags=["Anomalies"])

@router.get("/latest")
def latest_anomalies():
    """
    Get the latest anomalies from in-memory state.
    Returns the most recent anomaly records.
    """
    records = get_latest_anomalies()
    # Format records to match history endpoint format
    formatted = []
    for record in records:
        anomaly = record.get("anomaly", {})
        formatted.append({
            "timestamp": record.get("timestamp"),
            "satellite_id": record.get("satellite_id"),
            "severity": anomaly.get("severity", "normal"),
            "issues": anomaly.get("issues", []),
            "score": float(anomaly.get("score", 0.0)),
        })
    return {"data": formatted}

@router.get("/history")
def get_anomaly_history(limit: int = Query(50, ge=1, le=200)):
    db = SessionLocal()
    try:
        rows = (
            db.query(AnomalyEvent)
            .order_by(AnomalyEvent.id.desc())
            .limit(limit)
            .all()
        )
        result = [
            {
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "satellite_id": r.satellite_id,
                "severity": r.severity,
                "issues": r.issues.split(",") if r.issues else [],
                "score": r.score,
            } for r in rows
        ]
        return {"data": result}
    finally:
        db.close()
