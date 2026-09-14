"use client";

import { useState, useEffect } from "react";

export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "offline";

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  quality: ConnectionQuality;
  isSupported: boolean;
}

function computeQuality(isOnline: boolean, effectiveType?: string | null, rtt?: number | null): ConnectionQuality {
  if (!isOnline) return "offline";
  if (!effectiveType && (rtt === undefined || rtt === null)) return "good";

  if (effectiveType === "slow-2g" || effectiveType === "2g" || (rtt !== null && rtt !== undefined && rtt > 800)) {
    return "poor";
  }
  if (effectiveType === "3g" || (rtt !== null && rtt !== undefined && rtt > 400)) {
    return "fair";
  }
  if (effectiveType === "4g" && (rtt === null || rtt === undefined || rtt <= 150)) {
    return "excellent";
  }
  return "good";
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    return {
      isOnline,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: false,
      quality: isOnline ? "good" : "offline",
      isSupported: false,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const effectiveType = connection?.effectiveType || null;
      const downlink = connection?.downlink || null;
      const rtt = connection?.rtt || null;
      const saveData = connection?.saveData || false;
      const quality = computeQuality(isOnline, effectiveType, rtt);

      setStatus({
        isOnline,
        effectiveType,
        downlink,
        rtt,
        saveData,
        quality,
        isSupported: !!connection,
      });
    };

    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    if (connection) {
      connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (connection) {
        connection.removeEventListener("change", updateStatus);
      }
    };
  }, []);

  return status;
}
