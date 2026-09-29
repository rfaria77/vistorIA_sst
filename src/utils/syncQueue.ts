import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseSync";
import { recordSyncEvent } from "./syncDiagnostics";

export interface OutboxItem {
  id: string;
  action: "setDoc" | "deleteDoc";
  collectionName: string;
  docId: string;
  data?: any;
  timestamp: number;
  retries: number;
}

const OUTBOX_STORAGE_KEY = "vistoria_sst_outbox_queue";

export function getOutboxQueue(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOutboxQueue(queue: OutboxItem[]): void {
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("Failed to save outbox queue to localStorage", e);
  }
}

export function enqueueOutboxAction(
  action: "setDoc" | "deleteDoc",
  collectionName: string,
  docId: string,
  data?: any
): void {
  const queue = getOutboxQueue();
  // Remove existing pending action for the same document to keep latest state (deduplication)
  const filtered = queue.filter(
    (item) => !(item.collectionName === collectionName && item.docId === docId)
  );

  const newItem: OutboxItem = {
    id: `outbox-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    action,
    collectionName,
    docId,
    data: data ? JSON.parse(JSON.stringify(data)) : undefined,
    timestamp: Date.now(),
    retries: 0,
  };

  filtered.push(newItem);
  saveOutboxQueue(filtered);

  // Dispatch custom event for UI updates
  window.dispatchEvent(new CustomEvent("outbox-updated", { detail: { count: filtered.length } }));
}

let isProcessingOutbox = false;

export async function processOutboxQueue(): Promise<void> {
  if (isProcessingOutbox) return;
  if (!navigator.onLine) return;

  const queue = getOutboxQueue();
  if (queue.length === 0) return;

  isProcessingOutbox = true;
  const remaining: OutboxItem[] = [];

  for (const item of queue) {
    try {
      const docRef = doc(db, item.collectionName, item.docId);
      if (item.action === "setDoc") {
        await setDoc(docRef, item.data || {}, { merge: true });
      } else if (item.action === "deleteDoc") {
        await deleteDoc(docRef);
      }
      recordSyncEvent(
        item.collectionName,
        1,
        undefined,
        "outbox",
        `Outbox sincronizado: ${item.action} em ${item.collectionName}/${item.docId}`
      );
      // Successfully processed, do not add to remaining
    } catch (err: any) {
      console.warn(`Outbox sync failed for ${item.collectionName}/${item.docId}:`, err);
      recordSyncEvent(
        item.collectionName,
        0,
        err?.message || "Erro de rede",
        "error",
        `Falha Outbox em ${item.collectionName}/${item.docId}: ${err?.message || "Erro"}`
      );
      item.retries += 1;
      // Keep in queue if retries < 5
      if (item.retries < 5) {
        remaining.push(item);
      }
    }
  }

  saveOutboxQueue(remaining);
  isProcessingOutbox = false;

  window.dispatchEvent(new CustomEvent("outbox-updated", { detail: { count: remaining.length } }));
}

// Setup auto-sync listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processOutboxQueue();
  });

  // Periodically try processing outbox queue every 30 seconds if online
  setInterval(() => {
    if (navigator.onLine) {
      processOutboxQueue();
    }
  }, 30000);
}
