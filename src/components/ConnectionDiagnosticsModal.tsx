import React, { useState, useEffect } from "react";
import { X, Activity, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Layers, Clock, ShieldCheck, History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getSyncDiagnosticsLogs, getSyncEventHistory, SyncListenerLog, SyncEventHistoryItem } from "../utils/syncDiagnostics";
import { getOutboxQueue, processOutboxQueue } from "../utils/syncQueue";
import { measureFirestoreLatency } from "../utils/firebaseSync";

interface ConnectionDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionDiagnosticsModal: React.FC<ConnectionDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<Record<string, SyncListenerLog>>(getSyncDiagnosticsLogs());
  const [history, setHistory] = useState<SyncEventHistoryItem[]>(getSyncEventHistory());
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [outboxCount, setOutboxCount] = useState<number>(getOutboxQueue().length);
  const [testing, setTesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"listeners" | "historico">("listeners");

  const runDiagnostics = async () => {
    setTesting(true);
    setIsOnline(navigator.onLine);
    setOutboxCount(getOutboxQueue().length);
    setLogs(getSyncDiagnosticsLogs());
    setHistory(getSyncEventHistory());
    const lat = await measureFirestoreLatency();
    setLatency(lat);
    setTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.logs) setLogs(customEvent.detail.logs);
        if (customEvent.detail.history) setHistory(customEvent.detail.history);
      } else {
        setLogs(getSyncDiagnosticsLogs());
        setHistory(getSyncEventHistory());
      }
    };

    const handleOutbox = () => {
      setOutboxCount(getOutboxQueue().length);
    };

    window.addEventListener("sync-diagnostics-updated", handleUpdate);
    window.addEventListener("outbox-updated", handleOutbox);

    return () => {
      window.removeEventListener("sync-diagnostics-updated", handleUpdate);
      window.removeEventListener("outbox-updated", handleOutbox);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Diagnóstico de Conexão &amp; Sincronização</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Firestore RT
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80">
                Monitoramento em tempo real dos ouvintes e histórico de operações periciais
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Geral Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rede */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${isOnline ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOnline ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Status da Rede</span>
                <span className="text-sm font-extrabold">{isOnline ? "Online (Conectado)" : "Offline (Sem Conexão)"}</span>
              </div>
            </div>

            {/* Latência Firestore */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">Latência Firestore</span>
                <span className="text-sm font-extrabold">
                  {latency === null ? "Testando..." : latency === -1 ? "Falha / Timeout" : `${latency}ms`}
                </span>
              </div>
            </div>

            {/* Fila Outbox */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${outboxCount > 0 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${outboxCount > 0 ? "bg-amber-500 text-white animate-pulse" : "bg-slate-700 text-white"}`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Fila Pendente (Outbox)</span>
                <span className="text-sm font-extrabold">{outboxCount} alteração(ões)</span>
              </div>
            </div>
          </div>

          {/* Abas de Navegação (Listeners vs Histórico de Eventos) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("listeners")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === "listeners"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Listeners do Firestore</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("historico")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === "historico"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico de Eventos ({history.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={runDiagnostics}
              disabled={testing}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* CONTEÚDO DA ABA 1: LISTENERS */}
          {activeTab === "listeners" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Coleção (Firestore)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Itens Carregados</th>
                      <th className="p-3">Último Evento (Timestamp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {Object.values(logs).map((log) => {
                      const dataFormatada = log.lastEventTimestamp
                        ? new Date(log.lastEventTimestamp).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            fractionalSecondDigits: 3,
                          })
                        : "Aguardando evento...";

                      return (
                        <tr key={log.collectionName} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-indigo-900">
                            {log.collectionName}
                          </td>
                          <td className="p-3">
                            {log.status === "success" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo / Sincronizado
                              </span>
                            ) : log.status === "error" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]" title={log.errorMessage}>
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> Erro
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                                Aguardando
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-800">{log.itemCount}</td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{dataFormatada}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTEÚDO DA ABA 2: HISTÓRICO DE EVENTOS */}
          {activeTab === "historico" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Últimas 10 operações de leitura, escuta e sincronização (Outbox) realizadas no Firestore:
                </p>
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
                  Nenhum evento registrado nesta sessão ainda. Interaja com o sistema para gerar logs de sincronização.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">Horário</th>
                        <th className="p-3">Tipo / Coleção</th>
                        <th className="p-3">Descrição da Operação</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {history.map((ev) => {
                        const hora = new Date(ev.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });

                        return (
                          <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                              {hora}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase border border-indigo-100 font-mono">
                                {ev.type} • {ev.collectionName}
                              </span>
                            </td>
                            <td className="p-3 text-slate-800 font-medium">
                              {ev.description}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {ev.status === "success" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sucesso
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Falha
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Ações de Resolução de Problemas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Identificou disparidade de dados ou inspeções faltando?</h5>
              <p className="text-[11px] text-slate-500">
                Verifique acima se houve falhas de rede na fila Outbox e force o reenvio se necessário.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await processOutboxQueue();
                  runDiagnostics();
                  alert("Fila Outbox processada com sucesso!");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
              >
                Processar Fila Outbox
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
