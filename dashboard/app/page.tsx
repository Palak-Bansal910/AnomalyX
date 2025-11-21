"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/navbar"
import SatelliteFiltersPanel from "@/components/satellite-filters-panel"
import ActiveAlertsList, { type AlertItem } from "@/components/active-alerts-list"
import AnomalyHistoryTable from "@/components/anomaly-history-table"
import AnomalyScoreChart from "@/components/anomaly-score-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnomalyHistoryItem, Satellite, AnomalyStats } from "@/lib/mock_data"
import { mockAnomalies, mockSatellites, mockStats } from "@/lib/mock_data"

// Dynamic import for 3D component (no SSR)
const OrbitVisualizer3D = dynamic(() => import("@/components/orbit-visualiser"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground">Loading 3D Visualizer...</p>
    </div>
  )
})

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [satellites, setSatellites] = useState<Satellite[]>(mockSatellites)
  const [anomalies, setAnomalies] = useState<AnomalyHistoryItem[]>(mockAnomalies)
  const [stats, setStats] = useState<AnomalyStats>(mockStats)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [filters, setFilters] = useState({
    satelliteId: "SAT-01",
    fromDate: "",
    toDate: ""
  })

  // Check backend health
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        setIsConnected(true)
        return true
      }
    } catch (error) {
      setIsConnected(false)
    }
    return false
  }

  // Fetch satellites
  const fetchSatellites = async () => {
    try {
      const res = await fetch(`${API_BASE}/satellites`)
      if (res.ok) {
        const data = await res.json()
        setSatellites(data)
      }
    } catch (error) {
      console.error("Failed to fetch satellites:", error)
    }
  }

  // Fetch anomalies
  const fetchAnomalies = async () => {
    try {
      const res = await fetch(`${API_BASE}/anomalies?limit=50`)
      if (res.ok) {
        const data = await res.json()
        const formatted: AnomalyHistoryItem[] = data.map((item: any) => ({
          timestamp: item.timestamp,
          satellite_id: item.satellite_id,
          severity: item.severity,
          score: item.score,
          issues: item.issue.split(", ").filter((i: string) => i)
        }))
        setAnomalies(formatted)
        
        // Convert recent critical/high anomalies to alerts
        const recentAlerts: AlertItem[] = formatted
          .filter(a => a.severity === "critical" || a.severity === "warning")
          .slice(0, 5)
          .map((a, idx) => ({
            id: `alert-${idx}`,
            satelliteId: a.satellite_id,
            issue: a.issues.join(", ") || "Anomaly detected",
            severity: a.severity === "critical" ? "critical" : "high",
            timestamp: new Date(a.timestamp).toLocaleTimeString()
          }))
        setAlerts(recentAlerts)
      }
    } catch (error) {
      console.error("Failed to fetch anomalies:", error)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/anomalies/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      const connected = await checkHealth()
      if (connected) {
        await Promise.all([fetchSatellites(), fetchAnomalies(), fetchStats()])
      }
    }
    init()

    // Poll for updates
    const interval = setInterval(async () => {
      const connected = await checkHealth()
      if (connected) {
        await Promise.all([fetchAnomalies(), fetchStats()])
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    const connected = await checkHealth()
    if (connected) {
      await Promise.all([fetchSatellites(), fetchAnomalies(), fetchStats()])
    }
  }

  const handleConnectionToggle = async () => {
    await checkHealth()
  }

  // Filter anomalies by selected satellite
  const filteredAnomalies = anomalies.filter(a => 
    filters.satelliteId === "all" || a.satellite_id === filters.satelliteId
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <Navbar isConnected={isConnected} onConnectionToggle={handleConnectionToggle} />
      
      <main className="container mx-auto p-6 max-w-[1920px]">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Filters */}
          <div className="col-span-12 lg:col-span-3">
            <SatelliteFiltersPanel
              filters={filters}
              satellites={satellites}
              onFilterChange={setFilters}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{stats.total_anomalies_today}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-red-500/30 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400">{stats.critical_anomalies}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-blue-500/30 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">{stats.average_score.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-green-500/30 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{stats.online_satellites}</div>
                </CardContent>
              </Card>
            </div>

            {/* Orbit Visualizer */}
            <OrbitVisualizer3D />

            {/* Anomaly Score Chart */}
            <AnomalyScoreChart data={filteredAnomalies} selectedSatellite={filters.satelliteId} />
          </div>

          {/* Right sidebar - Alerts & History */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="h-[400px]">
              <ActiveAlertsList alerts={alerts} />
            </div>
          </div>

          {/* Full width history table */}
          <div className="col-span-12">
            <AnomalyHistoryTable history={filteredAnomalies} />
          </div>
        </div>
      </main>
    </div>
  )
}