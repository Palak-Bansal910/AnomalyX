"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface Satellite {
  satellite_id: string
  is_online: boolean
  latest_severity: string
  last_telemetry: string | null
}

interface FiltersPanelProps {
  filters: {
    satelliteId: string
    fromDate?: string
    toDate?: string
  }
  satellites?: Satellite[]
  onFilterChange: (filters: any) => void
  onRefresh: () => void
}

export default function SatelliteFiltersPanel({ filters, satellites, onFilterChange, onRefresh }: FiltersPanelProps) {
  const handleSatelliteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, satelliteId: e.target.value })
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, fromDate: e.target.value })
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, toDate: e.target.value })
  }

  // Use API satellites or fallback to default list
  const satelliteList = satellites && satellites.length > 0 
    ? satellites 
    : [
        { satellite_id: "SAT-01", is_online: true },
        { satellite_id: "SAT-02", is_online: true },
        { satellite_id: "SAT-03", is_online: true },
      ]

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-card-foreground flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        Satellite Filters
      </h2>

      <div className="space-y-5">
        {/* Satellite Dropdown */}
        <div className="animate-fade-in">
          <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Satellite ID</label>
          <select
            value={filters.satelliteId}
            onChange={handleSatelliteChange}
            className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:border-primary/50"
          >
            {satelliteList.map((sat) => (
              <option key={sat.satellite_id} value={sat.satellite_id}>
                {sat.satellite_id} {sat.is_online ? "🟢" : "🔴"}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wide">From Date</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={handleFromDateChange}
            className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:border-primary/50"
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wide">To Date</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={handleToDateChange}
            className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 hover:border-primary/50"
          />
        </div>

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <span className="mr-2">🔄</span>
          Refresh Data
        </Button>
      </div>
    </div>
  )
}
