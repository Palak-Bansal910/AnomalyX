from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TelemetrySchema(BaseModel):
    satellite_id: str
    temperature: Optional[float] = None
    rssi: Optional[float] = None
    snr: Optional[float] = None
    packet_loss: Optional[float] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    velocity_x: Optional[float] = None
    velocity_y: Optional[float] = None
    velocity_z: Optional[float] = None
    battery_voltage: Optional[float] = None
    solar_panel_current: Optional[float] = None
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnomalyCreate(BaseModel):
    satellite_id: str
    severity: str
    issue: str
    score: float
    timestamp: Optional[datetime] = None

class AnomalyResponse(BaseModel):
    id: int
    satellite_id: str
    severity: str
    issue: str
    score: float
    timestamp: datetime

    class Config:
        from_attributes = True

class SatelliteResponse(BaseModel):
    satellite_id: str
    is_online: bool
    latest_severity: str
    last_telemetry: Optional[datetime] = None

    class Config:
        from_attributes = True