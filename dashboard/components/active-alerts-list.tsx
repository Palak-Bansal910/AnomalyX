"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type AlertItem = {
  id: string;
  satelliteId: string;
  issue: string;
  severity: "critical" | "high" | "medium" | "low" | "normal";
  timestamp: string;
};

type ActiveAlertsListProps = {
  alerts: AlertItem[];
};

const severityColors: Record<AlertItem["severity"], { text: string; bg: string; border: string; glow: string }> = {
  critical: {
    text: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    glow: "shadow-red-500/50",
  },
  high: {
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    glow: "shadow-orange-500/50",
  },
  medium: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/50",
  },
  low: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/50",
  },
  normal: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    glow: "shadow-emerald-500/50",
  },
};

const severityLabel: Record<AlertItem["severity"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  normal: "Normal",
};

export default function ActiveAlertsList({ alerts }: ActiveAlertsListProps) {
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card to-card/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          Active Alerts
        </CardTitle>
        {hasAlerts ? (
          <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
        ) : (
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar pt-4">
        {!hasAlerts && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No active anomalies
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              All satellites are operating within normal parameters.
            </p>
          </div>
        )}

        {hasAlerts && (
          <ul className="space-y-3">
            {alerts.map((alert, idx) => {
              const colors = severityColors[alert.severity];
              return (
                <li
                  key={alert.id}
                  className={`flex items-start justify-between rounded-xl border-2 ${colors.border} ${colors.bg} px-4 py-3 text-sm hover:scale-[1.02] hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-pointer animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold text-card-foreground flex items-center gap-2">
                      <span className="text-lg">🛰️</span>
                      <span>Sat {alert.satelliteId}</span>
                      <span className="text-muted-foreground">–</span>
                      <span>{alert.issue}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {alert.timestamp}
                    </div>
                  </div>
                  <span
                    className={`ml-3 rounded-full border-2 ${colors.border} ${colors.bg} px-3 py-1 text-xs font-bold ${colors.text} whitespace-nowrap`}
                  >
                    {severityLabel[alert.severity]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
