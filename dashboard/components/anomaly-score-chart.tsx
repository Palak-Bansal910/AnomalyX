"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { AnomalyHistoryItem } from "@/lib/mock_data"

interface AnomalyScoreChartProps {
  data: AnomalyHistoryItem[]
  selectedSatellite: string
}

// Format time consistently (UTC) to avoid hydration mismatches
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export default function AnomalyScoreChart({ data, selectedSatellite }: AnomalyScoreChartProps) {
  // Transform data for chart - memoize to avoid hydration issues
  const chartData = useMemo(() => {
    return data.map((item) => ({
      timestamp: formatTime(item.timestamp),
      score: item.score,
      satellite: item.satellite_id,
    }))
  }, [data])

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-card-foreground flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Anomaly Score Trend
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9ca3af" 
            style={{ fontSize: "11px" }} 
            tick={{ fill: "#9ca3af" }}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis 
            stroke="#9ca3af" 
            style={{ fontSize: "11px" }} 
            tick={{ fill: "#9ca3af" }}
            axisLine={{ stroke: "#374151" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #3b82f6",
              borderRadius: "8px",
              color: "#f3f4f6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
            cursor={{ stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "5 5" }}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", paddingTop: "20px" }} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#1e40af" }}
            activeDot={{ r: 6, fill: "#60a5fa" }}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
