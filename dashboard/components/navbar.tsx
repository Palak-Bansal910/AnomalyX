"use client"

import { Radio } from "lucide-react"

interface NavbarProps {
  isConnected: boolean
  onConnectionToggle: () => void
}

export default function Navbar({ isConnected, onConnectionToggle }: NavbarProps) {
  return (
    <nav className="border-b-2 border-border/50 bg-gradient-to-r from-card/80 to-card/50 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3 animate-slide-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold shadow-lg hover:scale-110 transition-transform duration-300">
            <span className="text-xl">🛰️</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent">
            Satellite Anomaly Detector
          </h1>
        </div>

        <button
          onClick={onConnectionToggle}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
            isConnected
              ? "bg-gradient-to-r from-green-500/20 to-green-600/10 border-2 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-green-600/20"
              : "bg-gradient-to-r from-red-500/20 to-red-600/10 border-2 border-red-500/30 text-red-400 hover:from-red-500/30 hover:to-red-600/20"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isConnected ? "bg-green-400 shadow-green-400/50" : "bg-red-400 shadow-red-400/50"} shadow-lg`}></span>
          <span>Backend: {isConnected ? "Connected" : "Disconnected"}</span>
        </button>
      </div>
    </nav>
  )
}
