import { type DBSchema, openDB } from "idb";
import { useCallback, useEffect, useState } from "react";

export function createOfflineQueue<T extends { type: string }>(
  dbName: string,
  process: (item: T) => Promise<void>,
) {
  interface QueueDB extends DBSchema {
    queue: { key: number; value: T };
  }
  const STORE_NAME = "queue";

  async function getDB() {
    return openDB<QueueDB>(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "key",
          autoIncrement: true,
        });
      },
    });
  }

  return function useOfflineQueue() {
    const [pending, setPending] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const isSupported = typeof indexedDB !== "undefined";

    const refreshPending = useCallback(async () => {
      if (!isSupported) return;
      const db = await getDB();
      setPending(await db.count(STORE_NAME));
    }, [isSupported]);

    const enqueue = useCallback(
      async (item: T) => {
        if (!isSupported) return;
        const db = await getDB();
        await db.add(STORE_NAME, item);
        await refreshPending();
      },
      [refreshPending, isSupported],
    );

    const syncQueue = useCallback(async () => {
      if (!isSupported || !navigator.onLine) return;
      setSyncing(true);
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      let cursor = await tx.store.openCursor();
      while (cursor) {
        const { value } = cursor;
        try {
          await process(value);
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
    }, [refreshPending, process]);

    useEffect(() => {
      if (!isSupported) return;
      refreshPending();
      if (navigator.onLine) {
        void syncQueue();
      }
      window.addEventListener("online", syncQueue);
      return () => {
        window.removeEventListener("online", syncQueue);
      };
    }, [refreshPending, syncQueue, isSupported]);

    return { enqueue, pending, syncing, syncQueue };
  };
}
