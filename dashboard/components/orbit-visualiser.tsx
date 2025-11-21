"use client"

import { useState, useEffect } from "react"
import { Play, Pause } from "lucide-react"

export default function OrbitVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [position, setPosition] = useState({ x: 150, y: 150 })

  // Animate satellite position along orbit
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        const next = prev + 1
        return next > 100 ? 0 : next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isPlaying])

  // Calculate position based on playback time
  useEffect(() => {
    const angle = (playbackTime / 100) * Math.PI * 2
    const radius = 80
    const centerX = 150
    const centerY = 150

    setPosition({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    })
  }, [playbackTime])

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-card-foreground flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        Orbit Visualizer
      </h2>

      {/* SVG Visualization */}
      <svg width="100%" height="300" viewBox="0 0 300 300" className="mb-4 bg-gradient-to-br from-background/80 to-background/40 rounded-lg border border-border/50">
        {/* Orbital paths with glow */}
        <circle cx="150" cy="150" r="80" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.4" className="animate-pulse" />
        <circle cx="150" cy="150" r="120" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.3" />
        
        {/* Grid lines */}
        <line x1="150" y1="0" x2="150" y2="300" stroke="#374151" strokeWidth="0.5" opacity="0.2" />
        <line x1="0" y1="150" x2="300" y2="150" stroke="#374151" strokeWidth="0.5" opacity="0.2" />

        {/* Center point with glow */}
        <circle cx="150" cy="150" r="5" fill="#10b981" className="animate-pulse-glow" />
        <circle cx="150" cy="150" r="8" fill="#10b981" opacity="0.2" />

        {/* Satellite marker with trail */}
        <circle cx={position.x} cy={position.y} r="8" fill="#ef4444" className="drop-shadow-xl" />
        <circle
          cx={position.x}
          cy={position.y}
          r="12"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          opacity="0.4"
          className="animate-pulse"
        />
        <circle
          cx={position.x}
          cy={position.y}
          r="16"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          opacity="0.2"
          className="animate-pulse"
        />

        {/* Ground stations */}
        <rect x="145" y="275" width="10" height="20" fill="#06b6d4" className="drop-shadow-md" />
        <text x="150" y="300" fontSize="10" fill="#06b6d4" textAnchor="middle" fontWeight="bold">
          GS-01
        </text>
      </svg>

      {/* Playback Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <span className="text-sm text-muted-foreground">{isPlaying ? "Playing" : "Paused"}</span>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">Playback Time</label>
          <input
            type="range"
            min="0"
            max="100"
            value={playbackTime}
            onChange={(e) => {
              setPlaybackTime(Number(e.target.value))
              setIsPlaying(false)
            }}
            className="w-full"
          />
          <div className="mt-1 text-xs text-muted-foreground">{playbackTime}%</div>
        </div>
      </div>
    </div>
  )
}
