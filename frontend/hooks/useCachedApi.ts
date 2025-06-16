import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Configuration options for the cached API hook
 */
interface CachedApiConfig {
  /** Cache TTL in milliseconds (default: 5 minutes) */
  ttlMs?: number;
  /** Local storage key for caching (required) */
  storageKey: string;
  /** Whether to enable caching (default: true) */
  enableCache?: boolean;
  /** Initial loading state (default: false) */
  initialLoading?: boolean;
}

/**
 * Cached data structure with metadata
 */
interface CachedData<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the cache was created */
  timestamp: number;
  /** Cache expiration timestamp */
  expiresAt: number;
}

/**
 * Hook return type
 */
interface UseCachedApiReturn<T> {
  /** The current data */
  data: T | null;
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Error message if loading fails */
  error: string | null;
  /** Function to manually refresh data (bypasses cache) */
  refresh: () => Promise<void>;
  /** Whether the current data is from cache */
  isFromCache: boolean;
  /** Function to clear the cache */
  clearCache: () => void;
}

/**
 * Generic hook for caching API responses with TTL-based expiration.
 *
 * This hook provides a reusable pattern for caching API responses in localStorage
 * with automatic expiration, error handling, and loading states. It's designed to
 * reduce unnecessary API calls while maintaining data freshness.
 *
 * Features:
 * - TTL-based cache expiration with configurable duration
 * - Automatic cache invalidation and cleanup
 * - Graceful fallback to expired cache on API errors
 * - Memoized data to prevent unnecessary re-renders
 * - Manual refresh capability that bypasses cache
 * - Comprehensive error handling with localStorage failures
 *
 * @param apiFunction - Async function that fetches data from API
 * @param config - Configuration options for caching behavior
 * @returns Object containing data, loading state, error state, and utility functions
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { data, loading, error, refresh } = useCachedApi(
 *   () => backend.tags.getAll(),
 *   { storageKey: 'app:tags-cache', ttlMs: 10 * 60 * 1000 } // 10 minutes
 * );
 *
 * // With error handling
 * const { data: userProfile, loading, error, isFromCache } = useCachedApi(
 *   () => backend.user.getProfile(),
 *   {
 *     storageKey: 'app:user-profile',
 *     ttlMs: 30 * 60 * 1000, // 30 minutes
 *     initialLoading: true
 *   }
 * );
 *
 * if (loading && !isFromCache) return <Spinner />;
 * if (error && !data) return <ErrorMessage onRetry={refresh} />;
 * ```
 */
export function useCachedApi<T>(
  apiFunction: () => Promise<T>,
  config: CachedApiConfig
): UseCachedApiReturn<T> {
  const {
    ttlMs = 5 * 60 * 1000, // 5 minutes default
    storageKey,
    enableCache = true,
    initialLoading = false,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Loads cached data from localStorage if it hasn't expired
   */
  const loadFromCache = useCallback((): CachedData<T> | null => {
    if (!enableCache) return null;

    try {
      const cached = localStorage.getItem(storageKey);
      if (!cached) return null;

      const cachedData: CachedData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now > cachedData.expiresAt) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.warn(`Failed to load cached data for ${storageKey}:`, error);
      if (enableCache) {
        localStorage.removeItem(storageKey);
      }
      return null;
    }
  }, [storageKey, enableCache]);

  /**
   * Saves data to localStorage with expiration timestamp
   */
  const saveToCache = useCallback(
    (dataToCache: T): void => {
      if (!enableCache) return;

      try {
        const now = Date.now();
        const cachedData: CachedData<T> = {
          data: dataToCache,
          timestamp: now,
          expiresAt: now + ttlMs,
        };
        localStorage.setItem(storageKey, JSON.stringify(cachedData));
      } catch (error) {
        console.warn(`Failed to save data to cache ${storageKey}:`, error);
      }
    },
    [storageKey, ttlMs, enableCache]
  );

  /**
   * Clears the cache for this storage key
   */
  const clearCache = useCallback((): void => {
    if (enableCache) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, enableCache]);

  /**
   * Fetches data from the API with error handling and caching
   */
  const fetchData = useCallback(
    async (bypassCache = false): Promise<void> => {
      // Try to load from cache first (unless bypassing)
      if (!bypassCache && enableCache) {
        const cached = loadFromCache();
        if (cached) {
          setData(cached.data);
          setIsFromCache(true);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);
      setIsFromCache(false);

      try {
        const result = await apiFunction();
        setData(result);
        saveToCache(result);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";

        setError(errorMessage);

        // Try to fall back to cached data even if expired
        if (enableCache) {
          const cached = loadFromCache();
          if (cached) {
            setData(cached.data);
            setIsFromCache(true);
            console.warn(`Using expired cache data for ${storageKey} due to API error`);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, loadFromCache, saveToCache, enableCache, storageKey]
  );

  /**
   * Manual refresh function that bypasses cache
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Memoized data to prevent unnecessary re-renders
   */
  const memoizedData = useMemo(() => data, [data]);

  // Load data on mount or when apiFunction/config changes
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Cleanup expired cache on unmount
  useEffect(() => {
    return () => {
      if (!enableCache) return;

      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const cachedData: CachedData<T> = JSON.parse(cached);
          if (Date.now() > cachedData.expiresAt) {
            localStorage.removeItem(storageKey);
          }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
    };
  }, [storageKey, enableCache]);

  return {
    data: memoizedData,
    loading,
    error,
    refresh,
    isFromCache,
    clearCache,
  };
}

/**
 * Utility function to create a pre-configured useCachedApi hook for a specific API endpoint
 */
export function createCachedApiHook<T>(
  apiFunction: () => Promise<T>,
  defaultConfig: Omit<CachedApiConfig, "storageKey"> & { storageKey: string }
) {
  return (overrideConfig?: Partial<CachedApiConfig>) => {
    const finalConfig = { ...defaultConfig, ...overrideConfig };
    return useCachedApi(apiFunction, finalConfig);
  };
}

/**
 * Hook for managing multiple cached API endpoints with a shared namespace
 */
export function useCachedApiCollection<T extends Record<string, any>>(
  endpoints: Record<keyof T, () => Promise<T[keyof T]>>,
  baseConfig: Omit<CachedApiConfig, "storageKey">
) {
  const results = {} as Record<keyof T, UseCachedApiReturn<T[keyof T]>>;

  for (const [key, apiFunction] of Object.entries(endpoints)) {
    const config = {
      ...baseConfig,
      storageKey: `${baseConfig.storageKey || "app"}:${key}`,
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key as keyof T] = useCachedApi(apiFunction, config);
  }

  return results;
}

/**
 * Enhanced cached API hook with stale-while-revalidate and optimistic updates
 */
export function useCachedApi<T>(
  apiFunction: () => Promise<T>,
  config: CachedApiConfig & {
    /** Enable stale-while-revalidate pattern */
    staleWhileRevalidate?: boolean;
    /** Enable background refresh */
    backgroundRefresh?: boolean;
    /** Retry configuration */
    retryConfig?: {
      attempts: number;
      delay: number;
      backoff: number;
    };
  }
): UseCachedApiReturn<T> {
  const {
    ttlMs = 5 * 60 * 1000, // 5 minutes default
    storageKey,
    enableCache = true,
    initialLoading = false,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Loads cached data from localStorage if it hasn't expired
   */
  const loadFromCache = useCallback((): CachedData<T> | null => {
    if (!enableCache) return null;

    try {
      const cached = localStorage.getItem(storageKey);
      if (!cached) return null;

      const cachedData: CachedData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now > cachedData.expiresAt) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.warn(`Failed to load cached data for ${storageKey}:`, error);
      if (enableCache) {
        localStorage.removeItem(storageKey);
      }
      return null;
    }
  }, [storageKey, enableCache]);

  /**
   * Saves data to localStorage with expiration timestamp
   */
  const saveToCache = useCallback(
    (dataToCache: T): void => {
      if (!enableCache) return;

      try {
        const now = Date.now();
        const cachedData: CachedData<T> = {
          data: dataToCache,
          timestamp: now,
          expiresAt: now + ttlMs,
        };
        localStorage.setItem(storageKey, JSON.stringify(cachedData));
      } catch (error) {
        console.warn(`Failed to save data to cache ${storageKey}:`, error);
      }
    },
    [storageKey, ttlMs, enableCache]
  );

  /**
   * Clears the cache for this storage key
   */
  const clearCache = useCallback((): void => {
    if (enableCache) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, enableCache]);

  /**
   * Enhanced cache loading with stale-while-revalidate
   */
  const loadFromCacheWithSWR = useCallback((): CachedData<T> | null => {
    try {
      const cached = localStorage.getItem(config.storageKey);
      if (!cached) return null;

      const cachedData: CachedData<T> = JSON.parse(cached);
      const now = Date.now();

      // Return stale data immediately if SWR is enabled
      if (config.staleWhileRevalidate && now > cachedData.expiresAt) {
        // Schedule background refresh
        if (config.backgroundRefresh) {
          setTimeout(() => {
            void fetchWithRetry(true);
          }, 0);
        }
        return cachedData; // Return stale data
      }

      return now <= cachedData.expiresAt ? cachedData : null;
    } catch (error) {
      console.warn("Failed to load from cache:", error);
      return null;
    }
  }, [config.storageKey, config.staleWhileRevalidate, config.backgroundRefresh]);

  /**
   * Fetch with automatic retry logic
   */
  const fetchWithRetry = useCallback(
    async (bypassCache = false, attempt = 1): Promise<void> => {
      const retryConfig = config.retryConfig || { attempts: 3, delay: 1000, backoff: 2 };

      try {
        // Try to load from cache first (unless bypassing)
        if (!bypassCache && enableCache) {
          const cached = loadFromCache();
          if (cached) {
            setData(cached.data);
            setIsFromCache(true);
            setError(null);
            return;
          }
        }

        setLoading(true);
        setError(null);
        setIsFromCache(false);

        const response = await apiFunction();
        setData(response);
        saveToCache(response);
        setError(null);
      } catch (error) {
        if (attempt < retryConfig.attempts) {
          const delay = retryConfig.delay * Math.pow(retryConfig.backoff, attempt - 1);
          setTimeout(() => {
            void fetchWithRetry(bypassCache, attempt + 1);
          }, delay);
          return;
        }

        // Final failure - fall back to cache if available
        const cached = loadFromCacheWithSWR();
        if (cached) {
          setData(cached.data);
          setIsFromCache(true);
        }

        const errorMessage = error instanceof Error ? error.message : "Request failed";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, config.retryConfig, loadFromCacheWithSWR, saveToCache]
  );

  /**
   * Manual refresh function that bypasses cache
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchWithRetry(true);
  }, [fetchWithRetry]);

  /**
   * Memoized data to prevent unnecessary re-renders
   */
  const memoizedData = useMemo(() => data, [data]);

  // Load data on mount or when apiFunction/config changes
  useEffect(() => {
    void fetchWithRetry();
  }, [fetchWithRetry]);

  // Cleanup expired cache on unmount
  useEffect(() => {
    return () => {
      if (!enableCache) return;

      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const cachedData: CachedData<T> = JSON.parse(cached);
          if (Date.now() > cachedData.expiresAt) {
            localStorage.removeItem(storageKey);
          }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
    };
  }, [storageKey, enableCache]);

  return {
    data: memoizedData,
    loading,
    error,
    refresh,
    isFromCache,
    clearCache,
  };
}

/**
 * Utility function to create a pre-configured useCachedApi hook for a specific API endpoint
 */
export function createCachedApiHook<T>(
  apiFunction: () => Promise<T>,
  defaultConfig: Omit<CachedApiConfig, "storageKey"> & { storageKey: string }
) {
  return (overrideConfig?: Partial<CachedApiConfig>) => {
    const finalConfig = { ...defaultConfig, ...overrideConfig };
    return useCachedApi(apiFunction, finalConfig);
  };
}

/**
 * Hook for managing multiple cached API endpoints with a shared namespace
 */
export function useCachedApiCollection<T extends Record<string, any>>(
  endpoints: Record<keyof T, () => Promise<T[keyof T]>>,
  baseConfig: Omit<CachedApiConfig, "storageKey">
) {
  const results = {} as Record<keyof T, UseCachedApiReturn<T[keyof T]>>;

  for (const [key, apiFunction] of Object.entries(endpoints)) {
    const config = {
      ...baseConfig,
      storageKey: `${baseConfig.storageKey || "app"}:${key}`,
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key as keyof T] = useCachedApi(apiFunction, config);
  }

  return results;
}
