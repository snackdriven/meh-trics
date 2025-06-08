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
    const tx = db.transaction(STORE_NAME, "readwrite");
    let cursor = await tx.store.openCursor();
    while (cursor) {
      const { value } = cursor;
      try {
        if (value.type === "create") {
          await backend.task.createJournalEntry(value.data);
        } else {
          await backend.task.updateJournalEntry(value.data);
        }
        await cursor.delete();
      } catch (err) {
        console.error("Failed to sync entry", err);
        break;
      }
      cursor = await cursor.continue();
    }
    await tx.done;
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
