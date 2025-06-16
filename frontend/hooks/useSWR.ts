/**
 * SWR-style Data Fetching Hooks with Optimistic Updates
 *
 * This module provides optimized data fetching patterns with:
 * - Background refetching
 * - Request deduplication
 * - Optimistic updates
 * - Error recovery
 * - Cache management
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================
// Types
// ============================================

interface SWRConfig<T> {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  fallbackData?: T;
  suspense?: boolean;
}

interface SWRResponse<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (
    data?: T | Promise<T> | ((current: T | undefined) => T | Promise<T>),
    shouldRevalidate?: boolean
  ) => Promise<T | undefined>;
  revalidate: () => Promise<T | undefined>;
}

// ============================================
// Cache Management
// ============================================

class SWRCache {
  private cache = new Map<string, { data: any; timestamp: number; error?: Error }>();
  private pendingRequests = new Map<string, Promise<any>>();

  get<T>(key: string): { data: T; timestamp: number; error?: Error } | undefined {
    return this.cache.get(key) as { data: T; timestamp: number; error?: Error } | undefined;
  }

  set<T>(key: string, data: T, error?: Error): void {
    this.cache.set(key, { data, timestamp: Date.now(), error });
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getPendingRequest<T>(key: string): Promise<T> | undefined {
    return this.pendingRequests.get(key);
  }

  setPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

const swrCache = new SWRCache();

// ============================================
// Core SWR Hook
// ============================================

export function useSWR<T>(
  key: string | null,
  fetcher: (() => Promise<T>) | null,
  config: SWRConfig<T> = {}
): SWRResponse<T> {
  const {
    refreshInterval = 0,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    errorRetryInterval = 5000,
    fallbackData,
    suspense = false,
  } = config;

  const [data, setData] = useState<T | undefined>(() => {
    if (!key) return fallbackData;
    const cached = swrCache.get<T>(key);
    return cached?.data ?? fallbackData;
  });

  const [error, setError] = useState<Error | undefined>(() => {
    if (!key) return undefined;
    const cached = swrCache.get<T>(key);
    return cached?.error;
  });

  const [isLoading, setIsLoading] = useState(!data && !error);
  const [isValidating, setIsValidating] = useState(false);

  const retryCountRef = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const revalidate = useCallback(async (): Promise<T | undefined> => {
    if (!key || !fetcher || !mounted.current) return;

    // Check for existing request (deduplication)
    const existingRequest = swrCache.getPendingRequest<T>(key);
    if (existingRequest) {
      const now = Date.now();
      const cached = swrCache.get<T>(key);
      if (cached && now - cached.timestamp < dedupingInterval) {
        return existingRequest;
      }
    }

    setIsValidating(true);

    const requestPromise = fetcher()
      .then((result) => {
        if (!mounted.current) return result;

        setData(result);
        setError(undefined);
        setIsLoading(false);
        swrCache.set(key, result);
        retryCountRef.current = 0;

        return result;
      })
      .catch((err) => {
        if (!mounted.current) throw err;

        setError(err);
        setIsLoading(false);
        swrCache.set(key, data, err);

        // Retry logic
        if (retryCountRef.current < errorRetryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            if (mounted.current) {
              revalidate();
            }
          }, errorRetryInterval);
        }

        throw err;
      })
      .finally(() => {
        if (mounted.current) {
          setIsValidating(false);
        }
      });

    swrCache.setPendingRequest(key, requestPromise);
    return requestPromise;
  }, [key, fetcher, dedupingInterval, errorRetryCount, errorRetryInterval, data]);

  const mutate = useCallback(
    async (
      newData?: T | Promise<T> | ((current: T | undefined) => T | Promise<T>),
      shouldRevalidate = true
    ): Promise<T | undefined> => {
      if (!key) return;

      let resolvedData: T | undefined;

      if (typeof newData === "function") {
        resolvedData = await (newData as (current: T | undefined) => T | Promise<T>)(data);
      } else if (newData instanceof Promise) {
        resolvedData = await newData;
      } else {
        resolvedData = newData;
      }

      if (resolvedData !== undefined) {
        setData(resolvedData);
        swrCache.set(key, resolvedData);
      }

      if (shouldRevalidate) {
        return revalidate();
      }

      return resolvedData;
    },
    [key, data, revalidate]
  );

  // Initial fetch
  useEffect(() => {
    if (key && fetcher && !data && !error) {
      revalidate();
    }
  }, [key, fetcher, data, error, revalidate]);

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || !key || !fetcher) return;

    const interval = setInterval(() => {
      if (mounted.current) {
        revalidate();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, key, fetcher, revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || !key || !fetcher) return;

    const handleFocus = () => {
      if (mounted.current) {
        revalidate();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [revalidateOnFocus, key, fetcher, revalidate]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect || !key || !fetcher) return;

    const handleOnline = () => {
      if (mounted.current) {
        revalidate();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [revalidateOnReconnect, key, fetcher, revalidate]);

  const response = useMemo(
    () => ({
      data,
      error,
      isLoading,
      isValidating,
      mutate,
      revalidate,
    }),
    [data, error, isLoading, isValidating, mutate, revalidate]
  );

  // Suspense support
  if (suspense && isLoading && !data) {
    throw revalidate();
  }

  return response;
}

// ============================================
// Optimistic Update Helpers
// ============================================

export function useOptimisticUpdate<T>(
  swrResponse: SWRResponse<T>,
  updateFn: (data: T) => Promise<T>
) {
  return useCallback(
    async (optimisticData: T) => {
      try {
        // Apply optimistic update immediately
        await swrResponse.mutate(optimisticData, false);

        // Perform actual update
        const result = await updateFn(optimisticData);

        // Update with server response
        await swrResponse.mutate(result, false);

        return result;
      } catch (error) {
        // Revert on error
        await swrResponse.revalidate();
        throw error;
      }
    },
    [swrResponse, updateFn]
  );
}

// ============================================
// Prebuilt Hooks for Common Use Cases
// ============================================

interface TodayHabit {
  id: number;
  name: string;
  targetCount: number;
  frequency: string;
  currentCount?: number;
  notes?: string;
}

interface TodayTask {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
}

interface JournalEntry {
  id: number;
  content: string;
  date: string;
}

interface MoodEntry {
  id: number;
  mood: string;
  notes?: string;
}

export function useTodayHabits() {
  return useSWR<TodayHabit[]>(
    "today-habits",
    () => {
      // TODO: Replace with actual API call
      // return backend.habits.listForToday();
      return Promise.resolve([]);
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );
}

export function useTodayTasks() {
  return useSWR<TodayTask[]>(
    "today-tasks",
    () => {
      // TODO: Replace with actual API call
      // return backend.tasks.listForToday();
      return Promise.resolve([]);
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );
}

export function useTodayJournal() {
  const today = new Date().toISOString().split("T")[0];

  return useSWR<JournalEntry | null>(
    `journal-${today}`,
    () => {
      // TODO: Replace with actual API call
      // return backend.journal.getForDate(today);
      return Promise.resolve(null);
    },
    {
      revalidateOnFocus: false, // Journal doesn't change often
      refreshInterval: 0, // No auto refresh for journal
    }
  );
}

export function useTodayMood() {
  const today = new Date().toISOString().split("T")[0];

  return useSWR<MoodEntry | null>(
    `mood-${today}`,
    () => {
      // TODO: Replace with actual API call
      // return backend.mood.getForDate(today);
      return Promise.resolve(null);
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
}

// ============================================
// Cache Utilities
// ============================================

export const swrUtils = {
  /**
   * Clear all cached data
   */
  clearCache: () => swrCache.clear(),

  /**
   * Clear specific cache entry
   */
  clearKey: (key: string) => swrCache.delete(key),

  /**
   * Get all cache keys
   */
  getCacheKeys: () => swrCache.keys(),

  /**
   * Preload data
   */
  preload: async <T>(key: string, fetcher: () => Promise<T>) => {
    const existing = swrCache.get<T>(key);
    if (!existing || Date.now() - existing.timestamp > 60000) {
      try {
        const data = await fetcher();
        swrCache.set(key, data);
        return data;
      } catch (error) {
        swrCache.set(key, undefined, error as Error);
        throw error;
      }
    }
    return existing.data;
  },
};
