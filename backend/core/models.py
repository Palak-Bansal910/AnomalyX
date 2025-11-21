from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from .database import Base

class Telemetry(Base):
    __tablename__ = "telemetry"
    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(String, index=True)
    temperature = Column(Float, nullable=True)
    rssi = Column(Float, nullable=True)
    snr = Column(Float, nullable=True)
    packet_loss = Column(Float, nullable=True)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    position_z = Column(Float, nullable=True)
    velocity_x = Column(Float, nullable=True)
    velocity_y = Column(Float, nullable=True)
    velocity_z = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)
    solar_panel_current = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(String, index=True)
    severity = Column(String)
    issue = Column(String)
    score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class Satellite(Base):
    __tablename__ = "satellites"
    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(String, unique=True, index=True)
    is_online = Column(Boolean, default=True)
    latest_severity = Column(String, default="normal")
    last_telemetry = Column(DateTime, nullable=True)