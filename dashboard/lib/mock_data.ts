export interface AnomalyHistoryItem {
  timestamp: string
  satellite_id: string
  severity: "normal" | "warning" | "critical"
  issues: string[]
  score: number
}

// Mock data for anomaly history
// Future: Replace with GET /anomalies/history from FastAPI backend
export const mockHistory: AnomalyHistoryItem[] = [
  // SAT-01 data
  {
    timestamp: "2025-11-21T14:30:00Z",
    satellite_id: "SAT-01",
    severity: "critical",
    issues: ["Orbit deviation beyond 3σ", "Thermal spike in battery module"],
    score: 0.92,
  },
  {
    timestamp: "2025-11-21T13:45:00Z",
    satellite_id: "SAT-01",
    severity: "warning",
    issues: ["Slight increase in cosmic ray interactions"],
    score: 0.67,
  },
  {
    timestamp: "2025-11-21T12:15:00Z",
    satellite_id: "SAT-01",
    severity: "normal",
    issues: ["Normal operational status"],
    score: 0.12,
  },
  {
    timestamp: "2025-11-21T11:00:00Z",
    satellite_id: "SAT-01",
    severity: "warning",
    issues: ["Gyroscope drift detected"],
    score: 0.54,
  },
  {
    timestamp: "2025-11-20T20:30:00Z",
    satellite_id: "SAT-01",
    severity: "critical",
    issues: ["Solar panel degradation beyond expected rate"],
    score: 0.88,
  },

  // SAT-02 data
  {
    timestamp: "2025-11-21T14:20:00Z",
    satellite_id: "SAT-02",
    severity: "warning",
    issues: ["Anomalous attitude variation", "Power bus voltage fluctuation"],
    score: 0.71,
  },
  {
    timestamp: "2025-11-21T13:00:00Z",
    satellite_id: "SAT-02",
    severity: "normal",
    issues: ["All systems nominal"],
    score: 0.08,
  },
  {
    timestamp: "2025-11-21T10:45:00Z",
    satellite_id: "SAT-02",
    severity: "critical",
    issues: ["Communication link degradation", "Signal-to-noise ratio critical"],
    score: 0.95,
  },
  {
    timestamp: "2025-11-20T18:00:00Z",
    satellite_id: "SAT-02",
    severity: "normal",
    issues: ["Routine telemetry pass"],
    score: 0.15,
  },
  {
    timestamp: "2025-11-20T14:30:00Z",
    satellite_id: "SAT-02",
    severity: "warning",
    issues: ["Memory error correction events increasing"],
    score: 0.58,
  },

  // SAT-03 data
  {
    timestamp: "2025-11-21T14:10:00Z",
    satellite_id: "SAT-03",
    severity: "normal",
    issues: ["Nominal operation"],
    score: 0.22,
  },
  {
    timestamp: "2025-11-21T12:00:00Z",
    satellite_id: "SAT-03",
    severity: "warning",
    issues: ["Magnetic field sensor calibration drift"],
    score: 0.63,
  },
  {
    timestamp: "2025-11-21T09:30:00Z",
    satellite_id: "SAT-03",
    severity: "normal",
    issues: ["Systems healthy"],
    score: 0.18,
  },
  {
    timestamp: "2025-11-20T22:00:00Z",
    satellite_id: "SAT-03",
    severity: "critical",
    issues: ["Propellant leak detected", "Attitude control authority reduced"],
    score: 0.87,
  },
  {
    timestamp: "2025-11-20T16:45:00Z",
    satellite_id: "SAT-03",
    severity: "normal",
    issues: ["Standard operations"],
    score: 0.11,
  },

  // Additional data for full history
  {
    timestamp: "2025-11-20T12:00:00Z",
    satellite_id: "SAT-01",
    severity: "normal",
    issues: ["Routine check"],
    score: 0.14,
  },
  {
    timestamp: "2025-11-20T10:30:00Z",
    satellite_id: "SAT-02",
    severity: "warning",
    issues: ["Temperature variance in radiator"],
    score: 0.62,
  },
  {
    timestamp: "2025-11-20T08:15:00Z",
    satellite_id: "SAT-03",
    severity: "normal",
    issues: ["All green"],
    score: 0.09,
  },
  {
    timestamp: "2025-11-19T20:00:00Z",
    satellite_id: "SAT-01",
    severity: "critical",
    issues: ["Unexpected thrust vector deviation"],
    score: 0.91,
  },
  {
    timestamp: "2025-11-19T18:30:00Z",
    satellite_id: "SAT-02",
    severity: "normal",
    issues: ["Status nominal"],
    score: 0.13,
  },
]

// Mock KPI data
// Future: Replace with GET /telemetry/latest from FastAPI backend
export const mockKpis = {
  totalAnomaliesToday: 8,
  criticalAlerts: 3,
  avgAnomalyScore: 0.54,
  satellitesOnline: 3,
}
