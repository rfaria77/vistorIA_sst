import React, { useState } from "react";
import { WifiOff, Wifi, CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dispensado, setDispensado] = useState(false);

  if (isOnline) {
    return null;
  }

  if (dispensado) {
    return (
      <button
        type="button"
        onClick={() => setDispensado(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl hover:bg-amber-500 transition cursor-pointer border border-amber-400/40"
        title="Ver detalhes do modo offline"
      >
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Offline</span>
      </button>
    );
  }

  return (
    <div
      id="banner-modo-offline-pwa"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-3.5 shadow-2xl text-slate-100 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <CloudOff className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-white">Modo 100% Offline Ativo</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Campo / Sem Sinal
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Todas as fotos, laudos, carimbos forenses e assinaturas estão sendo gravados no armazenamento local e continuarão salvos com segurança.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDispensado(true)}
          className="text-slate-400 hover:text-white p-1 rounded cursor-pointer text-xs"
          title="Minimizar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
