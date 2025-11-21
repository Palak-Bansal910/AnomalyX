"use client"

import { useMemo } from "react"
import type { AnomalyHistoryItem } from '@/lib/mock_data'

interface AnomalyHistoryTableProps {
  history: AnomalyHistoryItem[]
}

// Format date consistently (UTC) to avoid hydration mismatches
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export default function AnomalyHistoryTable({ history }: AnomalyHistoryTableProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400"
      case "warning":
        return "text-amber-400"
      case "normal":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  // Memoize formatted history to avoid re-computation
  const formattedHistory = useMemo(() => {
    return history.slice(0, 15).map((item, idx) => ({
      ...item,
      formattedTime: formatTime(item.timestamp),
      key: `${item.satellite_id}-${item.timestamp}-${idx}`,
    }))
  }, [history])

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-card-foreground flex items-center gap-2">
        <span className="text-2xl">📋</span>
        Recent Anomaly Events
      </h2>

      <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border/50 bg-background/30 sticky top-0">
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Satellite</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Issues</th>
            </tr>
          </thead>
          <tbody>
            {formattedHistory.map((item, idx) => (
              <tr 
                key={item.key} 
                className="border-b border-border/20 hover:bg-primary/5 hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                  {item.formattedTime}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-card-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-lg">🛰️</span>
                    {item.satellite_id}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs font-bold ${getSeverityColor(item.severity)}`}>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/50">
                    {item.severity === "critical" && "🔴"}
                    {item.severity === "warning" && "🟡"}
                    {item.severity === "normal" && "🟢"}
                    {item.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {item.score.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[200px]">
                  {item.issues.slice(0, 2).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
