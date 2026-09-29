export interface SyncListenerLog {
  collectionName: string;
  lastEventTimestamp: number;
  itemCount: number;
  status: "success" | "error" | "pending";
  errorMessage?: string;
}

export interface SyncEventHistoryItem {
  id: string;
  timestamp: number;
  type: "listener" | "write" | "outbox" | "error";
  collectionName: string;
  description: string;
  status: "success" | "error";
  itemCount?: number;
}

const listenerLogs: Record<string, SyncListenerLog> = {
  usuarios: { collectionName: "usuarios", lastEventTimestamp: 0, itemCount: 0, status: "pending" },
  empresas: { collectionName: "empresas", lastEventTimestamp: 0, itemCount: 0, status: "pending" },
  rascunhos: { collectionName: "rascunhos", lastEventTimestamp: 0, itemCount: 0, status: "pending" },
  laudos: { collectionName: "laudos", lastEventTimestamp: 0, itemCount: 0, status: "pending" },
  programacoes: { collectionName: "programacoes", lastEventTimestamp: 0, itemCount: 0, status: "pending" },
};

const eventHistory: SyncEventHistoryItem[] = [];

export function recordSyncEvent(collectionName: string, itemCount: number, error?: string, type: "listener" | "write" | "outbox" | "error" = "listener", description?: string) {
  listenerLogs[collectionName] = {
    collectionName,
    lastEventTimestamp: Date.now(),
    itemCount,
    status: error ? "error" : "success",
    errorMessage: error,
  };

  const historyItem: SyncEventHistoryItem = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    type,
    collectionName,
    description: description || (error ? `Erro em ${collectionName}: ${error}` : `Atualização em ${collectionName} (${itemCount} itens)`),
    status: error ? "error" : "success",
    itemCount,
  };

  eventHistory.unshift(historyItem);
  if (eventHistory.length > 10) {
    eventHistory.pop();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sync-diagnostics-updated", {
        detail: {
          logs: { ...listenerLogs },
          history: [...eventHistory],
        },
      })
    );
  }
}

export function getSyncDiagnosticsLogs(): Record<string, SyncListenerLog> {
  return { ...listenerLogs };
}

export function getSyncEventHistory(): SyncEventHistoryItem[] {
  return [...eventHistory];
}
