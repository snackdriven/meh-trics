export type Store = {
  items: Array<{ key: number; value: any }>;
  nextKey: number;
};
const dbs: Record<string, Record<string, Store>> = {};

export function reset() {
  for (const db of Object.values(dbs)) {
    for (const store of Object.values(db)) {
      store.items = [];
      store.nextKey = 1;
    }
  }
  for (const name of Object.keys(dbs)) delete dbs[name];
}

export async function openDB(
  name: string,
  _version: number,
  options?: {
    upgrade(db: { createObjectStore(name: string, opts?: any): void }): void;
  }
) {
  if (!dbs[name]) {
    dbs[name] = {};
    if (options?.upgrade) {
      const upgradeDb = {
        createObjectStore(storeName: string) {
          dbs[name][storeName] = { items: [], nextKey: 1 };
        },
      };
      options.upgrade(upgradeDb);
    }
  }
  const dbData = dbs[name];
  return {
    add: async (storeName: string, value: any) => {
      const store = dbData[storeName];
      const key = store.nextKey++;
      store.items.push({ key, value });
      return key;
    },
    count: async (storeName: string) => {
      const store = dbData[storeName];
      return store.items.length;
    },
    transaction: (_storeName: string, _mode: "readonly" | "readwrite") => {
      const store = dbData[_storeName];
      let index = 0;
      const makeCursor = (): any => {
        if (index >= store.items.length) return null;
        const { key, value } = store.items[index];
        return {
          key,
          value,
          continue: async () => {
            index++;
            return makeCursor();
          },
        };
      };
      return {
        store: {
          openCursor: async () => makeCursor(),
          delete: async (key: number) => {
            const idx = store.items.findIndex((i) => i.key === key);
            if (idx >= 0) store.items.splice(idx, 1);
          },
        },
        done: Promise.resolve(),
      };
    },
  };
}
