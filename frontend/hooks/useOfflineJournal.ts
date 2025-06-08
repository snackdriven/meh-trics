import { type DBSchema, openDB } from "idb";
import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import type {
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
} from "~backend/task/types";

interface OfflineJournalDB extends DBSchema {
  queue: {
    key: number;
    value:
      | { type: "create"; data: CreateJournalEntryRequest }
      | { type: "update"; data: UpdateJournalEntryRequest };
  };
}

const DB_NAME = "offlineJournal";
const STORE_NAME = "queue";

async function getDB() {
  return openDB<OfflineJournalDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: "key", autoIncrement: true });
    },
  });
}

async function queueLength() {
  const db = await getDB();
  return db.count(STORE_NAME);
}

/**
 * Provides offline support for journal entries by queuing mutations when
 * the network is unavailable. Queued entries automatically sync once the
 * user comes back online.
 */
export function useOfflineJournal() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    setPending(await queueLength());
  }, []);

  const enqueue = useCallback(
    async (entry: OfflineJournalDB["queue"]["value"]) => {
      const db = await getDB();
      await db.add(STORE_NAME, entry);
      await refreshPending();
    },
    [refreshPending],
  );

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    const db = await getDB();

    // Read all queued items first so that the IndexedDB transaction
    // doesn't close while awaiting network requests.
    const readTx = db.transaction(STORE_NAME, "readonly");
    let cursor = await readTx.store.openCursor();
    const items: Array<OfflineJournalDB["queue"] & { key: number }> = [];
    while (cursor) {
      items.push({ ...(cursor.value as any), key: cursor.key as number });
      cursor = await cursor.continue();
    }
    await readTx.done;

    for (const item of items) {
      try {
        if (item.type === "create") {
          await backend.task.createJournalEntry(item.data);
        } else {
          await backend.task.updateJournalEntry(item.data);
        }
        const delTx = db.transaction(STORE_NAME, "readwrite");
        await delTx.store.delete(item.key);
        await delTx.done;
      } catch (err) {
        console.error("Failed to sync entry", err);
        break;
      }
    }

    await refreshPending();
    setSyncing(false);
  }, [refreshPending]);

  useEffect(() => {
    refreshPending();
    if (navigator.onLine) {
      void syncQueue();
    }
    window.addEventListener("online", syncQueue);
    return () => {
      window.removeEventListener("online", syncQueue);
    };
  }, [refreshPending, syncQueue]);

  const createEntry = useCallback(
    async (data: CreateJournalEntryRequest) => {
      if (navigator.onLine) {
        try {
          await backend.task.createJournalEntry(data);
          return;
        } catch {
          // fall back to queue
        }
      }
      await enqueue({ type: "create", data });
    },
    [enqueue],
  );

  const updateEntry = useCallback(
    async (data: UpdateJournalEntryRequest) => {
      if (navigator.onLine) {
        try {
          await backend.task.updateJournalEntry(data);
          return;
        } catch {
          // fall back to queue
        }
      }
      await enqueue({ type: "update", data });
    },
    [enqueue],
  );

  return {
    createEntry,
    updateEntry,
    pending,
    syncing,
    syncQueue,
  };
}
