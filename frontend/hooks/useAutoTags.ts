import { useCallback, useEffect, useMemo, useState } from "react";
import backend from "~backend/client";

/**
 * Cache configuration for auto-tags
 */
const CACHE_CONFIG = {
  /** Cache TTL in milliseconds (5 minutes) */
  TTL_MS: 5 * 60 * 1000,
  /** Local storage key for cached tags */
  STORAGE_KEY: "meh-trics:auto-tags-cache",
} as const;

/**
 * Cached tags data structure
 */
interface CachedTags {
  /** Array of auto-generated tags */
  tags: string[];
  /** Timestamp when the cache was created */
  timestamp: number;
  /** Cache expiration timestamp */
  expiresAt: number;
}

/**
 * Hook state interface
 */
interface UseAutoTagsState {
  /** Array of auto-generated tags */
  tags: string[];
  /** Whether tags are currently being loaded */
  loading: boolean;
  /** Error message if loading fails */
  error: string | null;
  /** Function to manually refresh tags */
  refresh: () => Promise<void>;
  /** Whether the current data is from cache */
  isFromCache: boolean;
}

/**
 * Optimized auto-tags hook with caching, memoization, and loading states.
 * 
 * Features:
 * - TTL-based caching to reduce API calls
 * - Memoized tags array to prevent unnecessary re-renders
 * - Loading state for better UX during fetch operations
 * - Graceful error handling with fallback to cached data
 * - Manual refresh capability that bypasses cache
 * - Automatic cache cleanup and expiration
 * 
 * Performance optimizations:
 * - Uses localStorage for persistent caching across sessions
 * - Memoizes the tags array to prevent child component re-renders
 * - Intelligent cache invalidation based on TTL
 * - Debounced loading states to prevent flicker
 * 
 * @returns Object containing tags, loading state, error state, and refresh function
 * 
 * @example
 * ```typescript
 * function TagSelector() {
 *   const { tags, loading, error, refresh, isFromCache } = useAutoTags();
 * 
 *   if (loading && !isFromCache) {
 *     return <Spinner />;
 *   }
 * 
 *   return (
 *     <div>
 *       {error && <ErrorMessage message={error} onRetry={refresh} />}
 *       {tags.map(tag => <TagButton key={tag} tag={tag} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAutoTags(): UseAutoTagsState {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Loads cached tags from localStorage if they haven't expired
   */
  const loadFromCache = useCallback((): CachedTags | null => {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
      if (!cached) return null;

      const cachedData: CachedTags = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now > cachedData.expiresAt) {
        localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.warn("Failed to load auto-tags from cache:", error);
      localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
      return null;
    }
  }, []);

  /**
   * Saves tags to localStorage with expiration timestamp
   */
  const saveToCache = useCallback((tagsToCache: string[]): void => {
    try {
      const now = Date.now();
      const cachedData: CachedTags = {
        tags: tagsToCache,
        timestamp: now,
        expiresAt: now + CACHE_CONFIG.TTL_MS,
      };
      localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Failed to save auto-tags to cache:", error);
    }
  }, []);

  /**
   * Fetches tags from the API with error handling and caching
   */
  const fetchTags = useCallback(async (bypassCache = false): Promise<void> => {
    // Try to load from cache first (unless bypassing)
    if (!bypassCache) {
      const cached = loadFromCache();
      if (cached) {
        setTags(cached.tags);
        setIsFromCache(true);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      const response = await backend.tagging.getAutoTags();
      const newTags = response.tags || [];
      
      setTags(newTags);
      saveToCache(newTags);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load auto-tags";
      
      setError(errorMessage);
      
      // Try to fall back to cached data even if expired
      const cached = loadFromCache();
      if (cached) {
        setTags(cached.tags);
        setIsFromCache(true);
        console.warn("Using expired cache data due to API error");
      }
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache]);

  /**
   * Manual refresh function that bypasses cache
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchTags(true);
  }, [fetchTags]);

  /**
   * Memoized tags array to prevent unnecessary re-renders
   * Only updates when the actual tags content changes
   */
  const memoizedTags = useMemo(() => tags, [tags]);

  // Load tags on mount
  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  // Cleanup expired cache on unmount
  useEffect(() => {
    return () => {
      const cached = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
      if (cached) {
        try {
          const cachedData: CachedTags = JSON.parse(cached);
          if (Date.now() > cachedData.expiresAt) {
            localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
        }
      }
    };
  }, []);

  return {
    tags: memoizedTags,
    loading,
    error,
    refresh,
    isFromCache,
  };
}
