"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "../lib/apiClient";

type Anomaly = {
  id: string | number;
  satellite: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  description: string;
};

export default function HomePage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Update this path to match your FastAPI endpoint
        const data = await fetchJson<Anomaly[]>("/anomalies");
        setAnomalies(data);
      } catch (err: any) {
        setError(err.message || "Failed to load anomalies");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/90 flex items-center justify-center text-xs font-bold">
              SA
            </div>
            <div>
              <div className="font-semibold tracking-tight">
                Satellite Anomaly Monitor
              </div>
              <div className="text-xs text-slate-400">
                Real-time anomaly detection dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Status:</span>
            <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-600/40">
              Operational
            </span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-3">
          {/* Left column: Summary + Filters */}
          <div className="space-y-4 md:col-span-1">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/40 p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                Anomaly Overview
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                  <div className="text-slate-400 mb-1">Total Anomalies</div>
                  <div className="text-xl font-semibold">
                    {anomalies.length}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                  <div className="text-slate-400 mb-1">Critical</div>
                  <div className="text-xl font-semibold text-rose-400">
                    {anomalies.filter((a) => a.severity === "critical").length}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/40 p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                Filters
              </h2>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="text-slate-500">
                  (You can later add satellite, orbit, and severity filters
                  here.)
                </p>
              </div>
            </section>
          </div>

          {/* Right column: Anomaly list */}
          <div className="md:col-span-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/40 p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">
                  Active Anomalies
                </h2>
                <span className="text-xs text-slate-500">
                  Live feed from backend API
                </span>
              </div>

              {loading && (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Loading anomalies from backend…
                </div>
              )}

              {error && !loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 px-3 py-2 rounded-xl">
                    Failed to load data: {error}
                  </div>
                </div>
              )}

              {!loading && !error && anomalies.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  No anomalies reported yet.
                </div>
              )}

              {!loading && !error && anomalies.length > 0 && (
                <div className="flex-1 overflow-auto mt-2">
                  <ul className="space-y-2">
                    {anomalies.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-slate-100">
                            {a.satellite}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {a.description}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(a.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 rounded-full border text-[10px] font-medium ${
                              a.severity === "critical"
                                ? "bg-rose-500/10 border-rose-500/60 text-rose-300"
                                : a.severity === "high"
                                ? "bg-amber-500/10 border-amber-500/60 text-amber-300"
                                : "bg-emerald-500/10 border-emerald-500/60 text-emerald-300"
                            }`}
                          >
                            {a.severity.toUpperCase()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
