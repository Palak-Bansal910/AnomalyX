from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import random

from core import models, schemas
from core.database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Satellite Anomaly Detector API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize some satellites on startup
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        # Check if satellites exist
        existing = db.query(models.Satellite).first()
        if not existing:
            satellites = ["SAT-01", "SAT-02", "SAT-03", "SAT-04", "SAT-05"]
            for sat_id in satellites:
                sat = models.Satellite(
                    satellite_id=sat_id,
                    is_online=True,
                    latest_severity="normal",
                    last_telemetry=datetime.utcnow()
                )
                db.add(sat)
            db.commit()
            print("✅ Initialized satellites")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "Satellite Anomaly Detector API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/satellites", response_model=List[schemas.SatelliteResponse])
def get_satellites(db: Session = Depends(get_db)):
    """Get all satellites"""
    satellites = db.query(models.Satellite).all()
    return satellites

@app.post("/telemetry/")
def receive_telemetry(data: schemas.TelemetrySchema, db: Session = Depends(get_db)):
    """Receive telemetry data and detect anomalies"""
    
    # Set timestamp if not provided
    if not data.timestamp:
        data.timestamp = datetime.utcnow()
    
    # Store telemetry
    telemetry = models.Telemetry(**data.dict())
    db.add(telemetry)
    
    # Update satellite status
    satellite = db.query(models.Satellite).filter(
        models.Satellite.satellite_id == data.satellite_id
    ).first()
    
    if satellite:
        satellite.last_telemetry = data.timestamp
        satellite.is_online = True
    else:
        satellite = models.Satellite(
            satellite_id=data.satellite_id,
            is_online=True,
            last_telemetry=data.timestamp
        )
        db.add(satellite)
    
    # Anomaly detection logic
    issues = []
    score = 0.0
    severity = "normal"

    if data.temperature and data.temperature > 70:
        issues.append("High Temperature")
        score += 0.6
    if data.temperature and data.temperature < -20:
        issues.append("Low Temperature")
        score += 0.5
    if data.packet_loss and data.packet_loss > 10:
        issues.append("High Packet Loss")
        score += 0.8
    if data.battery_voltage and data.battery_voltage < 20:
        issues.append("Low Battery")
        score += 0.7
    if data.rssi and data.rssi < -100:
        issues.append("Weak Signal")
        score += 0.4

    # Determine severity
    if score >= 0.8:
        severity = "critical"
    elif score >= 0.5:
        severity = "warning"
    elif len(issues) > 0:
        severity = "warning"

    # Store anomaly if detected
    anomaly_id = None
    if issues:
        anomaly = models.Anomaly(
            satellite_id=data.satellite_id,
            severity=severity,
            issue=", ".join(issues),
            score=score,
            timestamp=data.timestamp
        )
        db.add(anomaly)
        db.commit()
        db.refresh(anomaly)
        anomaly_id = anomaly.id
        
        # Update satellite severity
        if satellite:
            satellite.latest_severity = severity
    
    db.commit()
    
    return {
        "status": "ok",
        "anomaly_detected": bool(issues),
        "severity": severity,
        "score": score,
        "issues": issues,
        "anomaly_id": anomaly_id
    }

@app.get("/anomalies", response_model=List[schemas.AnomalyResponse])
def get_anomalies(
    satellite_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get anomalies, optionally filtered by satellite"""
    query = db.query(models.Anomaly)
    
    if satellite_id:
        query = query.filter(models.Anomaly.satellite_id == satellite_id)
    
    anomalies = query.order_by(models.Anomaly.timestamp.desc()).limit(limit).all()
    return anomalies

@app.get("/anomalies/latest")
def get_latest_anomalies(limit: int = 10, db: Session = Depends(get_db)):
    """Get latest anomalies across all satellites"""
    anomalies = db.query(models.Anomaly).order_by(
        models.Anomaly.timestamp.desc()
    ).limit(limit).all()
    return anomalies

@app.get("/anomalies/stats")
def get_anomaly_stats(db: Session = Depends(get_db)):
    """Get anomaly statistics"""
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    total_today = db.query(models.Anomaly).filter(
        models.Anomaly.timestamp >= today_start
    ).count()
    
    critical_count = db.query(models.Anomaly).filter(
        models.Anomaly.severity == "critical",
        models.Anomaly.timestamp >= today_start
    ).count()
    
    # Average score today
    from sqlalchemy import func
    avg_score = db.query(func.avg(models.Anomaly.score)).filter(
        models.Anomaly.timestamp >= today_start
    ).scalar() or 0.0
    
    # Online satellites
    online_sats = db.query(models.Satellite).filter(
        models.Satellite.is_online == True
    ).count()
    
    return {
        "total_anomalies_today": total_today,
        "critical_anomalies": critical_count,
        "average_score": round(avg_score, 2),
        "online_satellites": online_sats
    }

@app.get("/telemetry/latest")
def get_latest_telemetry(
    satellite_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get latest telemetry data"""
    query = db.query(models.Telemetry)
    
    if satellite_id:
        query = query.filter(models.Telemetry.satellite_id == satellite_id)
    
    telemetry = query.order_by(models.Telemetry.timestamp.desc()).limit(limit).all()
    return telemetry

# Simulator endpoint for demo
@app.post("/simulator/generate")
def generate_simulated_data(count: int = 10, db: Session = Depends(get_db)):
    """Generate simulated telemetry data"""
    satellites = ["SAT-01", "SAT-02", "SAT-03", "SAT-04", "SAT-05"]
    generated = []
    
    for _ in range(count):
        sat_id = random.choice(satellites)
        
        # Generate realistic telemetry
        telemetry_data = schemas.TelemetrySchema(
            satellite_id=sat_id,
            temperature=random.uniform(-15, 85),
            rssi=random.uniform(-110, -60),
            snr=random.uniform(5, 25),
            packet_loss=random.uniform(0, 15),
            position_x=random.uniform(-10000, 10000),
            position_y=random.uniform(-10000, 10000),
            position_z=random.uniform(300, 800),
            velocity_x=random.uniform(-5, 5),
            velocity_y=random.uniform(-5, 5),
            velocity_z=random.uniform(-2, 2),
            battery_voltage=random.uniform(18, 28),
            solar_panel_current=random.uniform(0.5, 3.5),
            timestamp=datetime.utcnow()
        )
        
        result = receive_telemetry(telemetry_data, db)
        generated.append(result)
    
    return {"generated": count, "results": generated}