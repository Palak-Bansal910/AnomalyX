"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

/* ----- simple fetcher that reads NEXT_PUBLIC_API_BASE_URL ----- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const fetcher = (path: string) => fetch(`${API_BASE}${path}`).then((r) => {
  if (!r.ok) throw new Error(`API ${r.status} ${r.statusText}`);
  return r.json();
});

/* ---------- Inline small components so build won't fail ---------- */

function Navbar({ isConnected, onConnectionToggle }: { isConnected: boolean; onConnectionToggle: () => void; }) {
  return (
    <header className="border-b border-border bg-background/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-xs font-bold">
            SA
          </div>
          <div>
            <div className="font-semibold tracking-tight">Satellite Anomaly Monitor</div>
            <div className="text-xs text-muted-foreground">Real-time anomaly detection</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onConnectionToggle}
            className={`px-3 py-1 rounded-lg text-xs font-medium border ${isConnected ? "bg-emerald-600/10 border-emerald-500/30" : "bg-rose-600/10 border-rose-500/30"}`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </button>
        </div>
      </div>
    </header>
  );
}

function SatelliteFiltersPanel({ filters, satellites, onFilterChange, onRefresh }: any) {
  return (
    <div className="card p-4 animate-slide-in">
      <h3 className="text-sm font-semibold mb-3">Filters</h3>
      <div className="space-y-2 text-xs text-muted-foreground">
        <label className="block">
          Satellite
          <select
            value={filters.satelliteId}
            onChange={(e) => onFilterChange({ ...filters, satelliteId: e.target.value })}
            className="mt-1 w-full rounded border p-2 bg-background"
          >
            {Array.isArray(satellites) && satellites.length > 0 ? (
              satellites.map((s: any) => <option key={s.satellite_id} value={s.satellite_id}>{s.satellite_id}</option>)
            ) : (
              <option value={filters.satelliteId}>{filters.satelliteId}</option>
            )}
          </select>
        </label>
        <div className="flex gap-2">
          <input type="date" value={filters.fromDate} onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })} className="rounded border p-2 w-full bg-background text-xs"/>
          <input type="date" value={filters.toDate} onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })} className="rounded border p-2 w-full bg-background text-xs"/>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="px-3 py-2 rounded bg-primary/20 border border-primary/30 text-xs">Refresh</button>
        </div>
      </div>
    </div>
  );
}

/* placeholder - replace with real visualization later */
function OrbitVisualizer() {
  return (
    <div className="card p-4 h-48 flex items-center justify-center animate-fade-in">
      <div className="text-sm text-muted-foreground">Orbit visualizer placeholder (replace with WebGL/three.js)</div>
    </div>
  );
}

/* placeholder small chart */
function AnomalyScoreChart({ data }: { data: any[] }) {
  return (
    <div className="card p-4 h-44 animate-fade-in">
      <div className="text-sm text-muted-foreground">Score chart placeholder — {data?.length ?? 0} datapoints</div>
    </div>
  );
}

function ActiveAlertsList({ alerts }: { alerts: any[] }) {
  return (
    <div className="card p-4 animate-slide-in">
      <h3 className="text-sm font-semibold mb-2">Active Alerts</h3>
      <ul className="space-y-2 text-xs">
        {(alerts || []).slice(0, 6).map((a: any) => (
          <li key={a.id} className="flex items-center justify-between bg-background/30 p-2 rounded">
            <div>
              <div className="font-semibold">{a.satelliteId}</div>
              <div className="text-muted-foreground text-xs">{a.issue}</div>
            </div>
            <div className="text-xs text-muted-foreground">{a.timestamp}</div>
          </li>
        ))}
        {(!alerts || alerts.length === 0) && <li className="text-muted-foreground text-xs">No active alerts</li>}
      </ul>
    </div>
  );
}

function AnomalyHistoryTable({ history }: { history: any[] }) {
  const formatted = (history || []).slice(0, 15).map((h, i) => ({ ...h, key: `${h.satellite_id}-${i}` }));
  return (
    <div className="card p-4 animate-fade-in">
      <h3 className="text-sm font-semibold mb-3">Recent Events</h3>
      <div className="overflow-auto max-h-56 custom-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="pb-2">Time</th>
              <th className="pb-2">Satellite</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {formatted.map((r: any, idx: number) => (
              <tr key={r.key} className={`border-t border-border/20 ${idx % 2 === 0 ? "bg-background/5" : ""}`}>
                <td className="py-2 font-mono">{new Date(r.timestamp).toISOString().split("T")[1]?.split(".")[0]}</td>
                <td className="py-2">{r.satellite_id}</td>
                <td className="py-2 font-bold">{String(r.severity).toUpperCase()}</td>
                <td className="py-2">{(r.score ?? 0).toFixed ? (r.score).toFixed(2) : r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend, icon }: { label: string; value: string | number; trend: string; icon: string; }) {
  const trendColors = { up: "text-red-400", down: "text-green-400", stable: "text-blue-400" };
  return (
    <div className={`rounded-xl p-4 border border-border bg-card/40`} >
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={trendColors[trend as keyof typeof trendColors]}>{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-card-foreground">{value}</div>
    </div>
  );
}

/* ---------- actual page logic ---------- */

type Anomaly = {
  satellite_id: string;
  timestamp: string;
  severity: string;
  score: number;
  issues: string[];
};

export default function Home() {
  const [isConnected, setIsConnected] = useState(true);
  const [filters, setFilters] = useState({ satelliteId: "SAT-01", fromDate: "", toDate: "" });

  const { data: anomaliesData, error: anomaliesError, mutate: refreshAnomalies } = useSWR<Anomaly[]>(
    "/anomalies",
    () => fetcher("/anomalies"),
    { refreshInterval: 5000, revalidateOnFocus: true, errorRetryCount: 0 }
  );

  const { data: satellitesData, error: satellitesError, mutate: refreshSatellites } = useSWR<any[]>(
    "/satellites",
    () => fetcher("/satellites"),
    { refreshInterval: 30000, errorRetryCount: 0 }
  );

  useEffect(() => {
    setIsConnected(!(!!anomaliesError || !!satellitesError));
  }, [anomaliesError, satellitesError]);

  useEffect(() => {
    if (Array.isArray(satellitesData) && satellitesData.length > 0 && !filters.satelliteId) {
      setFilters((p) => ({ ...p, satelliteId: satellitesData[0].satellite_id }));
    }
  }, [satellitesData]);

  // deterministic date-only filter strings to avoid SSR mismatch
  const filtered = useMemo(() => {
    const list = Array.isArray(anomaliesData) ? anomaliesData : [];
    const from = filters.fromDate ? new Date(filters.fromDate).toISOString().split("T")[0] : null;
    const to = filters.toDate ? new Date(filters.toDate).toISOString().split("T")[0] : null;
    return list.filter((it) => {
      const d = new Date(it.timestamp).toISOString().split("T")[0];
      const matches = it.satellite_id === filters.satelliteId;
      const after = !from || d >= from;
      const before = !to || d <= to;
      return matches && after && before;
    });
  }, [anomaliesData, filters]);

  // build alerts
  const alerts = useMemo(() => {
    return (filtered || []).filter((f) => f.severity !== "normal").map((f, i) => ({
      id: `${f.satellite_id}-${i}`,
      satelliteId: f.satellite_id,
      issue: (f.issues || []).slice(0, 2).join(", ") || "Anomaly",
      severity: f.severity,
      timestamp: new Date(f.timestamp).toISOString().replace("T", " ").slice(0, 16),
    }));
  }, [filtered]);

  const kpis = {
    totalToday: (filtered || []).filter((i) => new Date(i.timestamp).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]).length,
    critical: (filtered || []).filter((i) => i.severity === "critical").length,
    avgScore: ((filtered || []).reduce((s, it) => s + (it.score || 0), 0) / Math.max(1, (filtered || []).length)).toFixed(2),
    online: (satellitesData || []).filter((s: any) => s.is_online).length || 0,
  };

  const handleRefresh = () => { refreshAnomalies(); refreshSatellites(); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isConnected={isConnected} onConnectionToggle={() => setIsConnected((v) => !v)} />

      {!isConnected && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-b px-6 py-4 animate-slide-in shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-pulse">⚠️</div>
              <div>
                <div className="font-semibold text-amber-200">Backend Connection Unavailable</div>
                <div className="text-xs text-muted-foreground">{(anomaliesError || satellitesError)?.message || `Try starting backend at ${API_BASE}`}</div>
              </div>
            </div>
            <div>
              <button onClick={handleRefresh} className="px-3 py-2 rounded bg-primary/20 border border-primary/30 text-xs">Retry</button>
            </div>
          </div>
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-4">
            <SatelliteFiltersPanel filters={filters} satellites={satellitesData} onFilterChange={setFilters} onRefresh={handleRefresh} />
            <div className="card p-4 animate-fade-in">
              <h4 className="text-sm font-semibold mb-3">Live KPIs</h4>
              <div className="grid grid-cols-2 gap-3">
                <KPICard label="Total Today" value={kpis.totalToday} trend="up" icon="📊" />
                <KPICard label="Critical" value={kpis.critical} trend="up" icon="🚨" />
                <KPICard label="Avg Score" value={kpis.avgScore} trend="down" icon="📈" />
                <KPICard label="Online" value={kpis.online} trend="stable" icon="🛰️" />
              </div>
            </div>
          </div>

          {/* center */}
          <div className="space-y-4">
            <OrbitVisualizer />
            <AnomalyScoreChart data={filtered} />
          </div>

          {/* right */}
          <div className="space-y-4">
            <ActiveAlertsList alerts={alerts} />
            <AnomalyHistoryTable history={filtered} />
          </div>
        </div>
      </main>
    </div>
  );
}
