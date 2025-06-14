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

      // Read all queued items first to avoid keeping a transaction
      // open while awaiting network requests.
      const readTx = db.transaction(STORE_NAME, "readonly");
      let cursor = await readTx.store.openCursor();
      const items: Array<{ key: number; value: T }> = [];
      while (cursor) {
        items.push({ key: cursor.key as number, value: cursor.value });
        cursor = await cursor.continue();
      }
      await readTx.done;

      for (const item of items) {
        try {
          await process(item.value);
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
    }, [refreshPending, process, isSupported]);

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
