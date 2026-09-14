"use client";

import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import {
  IconWifi,
  IconWifiOff,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";

interface NetworkStatusBadgeProps {
  variant?: "pill" | "minimal" | "banner";
  className?: string;
  onRetry?: () => void;
}

export default function NetworkStatusBadge({
  variant = "pill",
  className = "",
  onRetry,
}: NetworkStatusBadgeProps) {
  const { isOnline, effectiveType, quality, rtt } = useNetworkStatus();

  // If offline
  if (!isOnline) {
    if (variant === "banner") {
      return (
        <div
          className={`w-full p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-3 text-xs font-bold ${className}`}
        >
          <div className="flex items-center gap-2">
            <IconWifiOff size={16} className="shrink-0 text-red-400 animate-pulse" />
            <span>You are currently offline. Check your internet.</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider ${className}`}
        title="No internet connection detected"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
        <span>Offline</span>
      </div>
    );
  }

  // Poor / Slow connection
  if (quality === "poor" || quality === "fair") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider ${className}`}
        title={`Network is slow (${effectiveType || "Weak"}${rtt ? ` • ${rtt}ms` : ""})`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span>Slow ({effectiveType ? effectiveType.toUpperCase() : "Weak"})</span>
      </div>
    );
  }

  // Minimal mode (dot only)
  if (variant === "minimal") {
    return (
      <div
        className={`w-2 h-2 rounded-full bg-emerald-500 shrink-0 ${className}`}
        title={`Connected (${effectiveType ? effectiveType.toUpperCase() : "Online"})`}
      />
    );
  }

  // Good / Excellent Online
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider ${className}`}
      title={`Live Connection (${effectiveType ? effectiveType.toUpperCase() : "Online"}${rtt ? ` • ${rtt}ms` : ""})`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span>{effectiveType ? effectiveType.toUpperCase() : "Live"}</span>
    </div>
  );
}
