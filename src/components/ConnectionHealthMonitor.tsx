import React, { useState, useEffect } from "react";
import { AlertTriangle, WifiOff, RefreshCw, X } from "lucide-react";
import { measureFirestoreLatency } from "../utils/firebaseSync";

export const ConnectionHealthMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [latency, setLatency] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  const runHealthCheck = async () => {
    const online = navigator.onLine;
    setIsOnline(online);

    if (!online) {
      setShowAlert(true);
      setLatency(-1);
      return;
    }

    setChecking(true);
    try {
      const lat = await measureFirestoreLatency();
      setLatency(lat);

      // If latency exceeds 2000ms (2 seconds) or fails (-1)
      if (lat === -1 || lat > 2000) {
        setShowAlert(true);
      } else {
        // Hide alert if latency is good and was previously showing due to performance
        setShowAlert(false);
      }
    } catch {
      setLatency(-1);
      setShowAlert(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Run initial health check after 3 seconds
    const initialTimer = setTimeout(() => {
      runHealthCheck();
    }, 3000);

    // Run every 60 seconds as requested
    const interval = setInterval(() => {
      runHealthCheck();
    }, 60000);

    const handleOnline = () => {
      setIsOnline(true);
      runHealthCheck();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
      setLatency(-1);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs font-bold z-80 relative">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto">
        <div className="w-6 h-6 rounded-full bg-rose-700 flex items-center justify-center shrink-0">
          {!isOnline || latency === -1 ? (
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          )}
        </div>
        <span>
          {!isOnline
            ? "⚠️ Alerta de Conexão: O sistema está offline. As alterações serão salvas localmente até a reconexão."
            : latency === -1
            ? "⚠️ Alerta de Saúde (Health Check): Falha ao comunicar com o Firestore. Verifique sua rede."
            : `⚠️ Alerta de Saúde (Health Check): Latência alta detectada com o Firestore (${latency}ms > 2.0s). A sincronização pode apresentar atrasos.`}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            runHealthCheck();
          }}
          disabled={checking}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
          <span>Testar Novamente</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAlert(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
          title="Fechar Alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
