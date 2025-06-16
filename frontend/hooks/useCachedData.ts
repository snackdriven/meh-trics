import { useCallback, useEffect, useState } from "react";

export interface CachedResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export function useCachedData<T>(key: string, fetcher: () => Promise<T>): CachedResult<T> {
  const [data, setData] = useState<T | null>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(data === null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await fetcher();
      setData(result);
      localStorage.setItem(key, JSON.stringify(result));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetcher, key]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refreshing, refresh: load };
}
