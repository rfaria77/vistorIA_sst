import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Layers } from "lucide-react";
import { measureFirestoreLatency } from "../utils/firebaseSync";
import { getOutboxQueue, processOutboxQueue } from "../utils/syncQueue";
import { ConnectionDiagnosticsModal } from "./ConnectionDiagnosticsModal";

export const SyncStatusIndicator: React.FC = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [checking, setChecking] = useState<boolean>(false);
  const [outboxCount, setOutboxCount] = useState<number>(() => getOutboxQueue().length);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  const checkStatus = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setLatency(null);
      return;
    }
    setIsOnline(true);
    setChecking(true);
    const lat = await measureFirestoreLatency();
    setLatency(lat);
    setChecking(false);
    // Also trigger outbox sync check
    processOutboxQueue();
  };

  useEffect(() => {
    checkStatus();

    const handleOnline = () => {
      setIsOnline(true);
      checkStatus();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLatency(null);
    };

    const handleOutboxUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.count === "number") {
        setOutboxCount(customEvent.detail.count);
      } else {
        setOutboxCount(getOutboxQueue().length);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("outbox-updated", handleOutboxUpdate);

    // Ping every 25 seconds to keep latency updated
    const interval = setInterval(checkStatus, 25000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("outbox-updated", handleOutboxUpdate);
      clearInterval(interval);
    };
  }, []);

  // Determine status color and label
  let dotColor = "bg-emerald-500";
  let textColor = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  let bgColor = "bg-emerald-500/10";
  let label = "Sincronizado";

  if (!isOnline || latency === -1 || latency === null) {
    dotColor = "bg-rose-500";
    textColor = "text-rose-400";
    borderColor = "border-rose-500/30";
    bgColor = "bg-rose-500/10";
    label = "Offline";
  } else if (latency > 800) {
    dotColor = "bg-amber-500";
    textColor = "text-amber-400";
    borderColor = "border-amber-500/30";
    bgColor = "bg-amber-500/10";
    label = `${latency}ms (Lento)`;
  } else {
    label = `${latency}ms`;
  }

  return (
    <>
      <div
        onClick={() => {
          setShowDiagnostics(true);
        }}
        className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${borderColor} ${bgColor} text-[11px] font-bold cursor-pointer transition-all hover:opacity-80`}
        title={
          !isOnline || latency === -1
            ? `Modo Offline • ${outboxCount} alterações pendentes na fila Outbox (Clique para Diagnóstico)`
            : `Sincronização em Tempo Real Ativa • Latência: ${latency}ms • Fila Outbox: ${outboxCount} pendentes (Clique para Diagnóstico)`
        }
      >
        <span className="relative flex h-2 w-2">
          {isOnline && latency !== -1 && outboxCount === 0 && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                (latency || 0) > 800 ? "bg-amber-400" : "bg-emerald-400"
              }`}
            ></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${outboxCount > 0 ? "bg-amber-500 animate-pulse" : dotColor}`}></span>
        </span>

        <span className={`tracking-tight ${textColor} flex items-center gap-1.5`}>
          {checking && latency === null ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Sincronizando...
            </span>
          ) : !isOnline || latency === -1 ? (
            <span className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Offline {outboxCount > 0 && `(${outboxCount})`}
            </span>
          ) : outboxCount > 0 ? (
            <span className="flex items-center gap-1 text-amber-300">
              <Layers className="w-3 h-3 animate-spin" /> {outboxCount} pendente(s)
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3" /> {label}
            </span>
          )}
        </span>
      </div>

      <ConnectionDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </>
  );
};
