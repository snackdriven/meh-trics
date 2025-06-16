import { useMemo } from "react";
import backend from "~backend/client";
import { useCachedApi } from "./useCachedApi";

/**
 * Simplified auto-tags hook using the generic caching hook.
 *
 * This version demonstrates how to use the useCachedApi hook for a specific
 * API endpoint. It provides the same functionality as the original useAutoTags
 * but with less code duplication.
 *
 * @returns Object containing tags, loading state, error state, and refresh function
 */
export function useAutoTagsSimplified() {
  const {
    data: response,
    loading,
    error,
    refresh,
    isFromCache,
  } = useCachedApi(() => backend.tagging.getAutoTags(), {
    storageKey: "meh-trics:auto-tags-cache",
    ttlMs: 5 * 60 * 1000, // 5 minutes
    initialLoading: false,
  });

  // Extract tags from response and memoize
  const tags = useMemo(() => {
    return response?.tags || [];
  }, [response]);

  return {
    tags,
    loading,
    error,
    refresh,
    isFromCache,
  };
}

/**
 * Alternative implementation using createCachedApiHook for pre-configuration
 */
const useAutoTagsAPI = (() => {
  const apiFunction = () => backend.tagging.getAutoTags();
  const config = {
    storageKey: "meh-trics:auto-tags-cache",
    ttlMs: 5 * 60 * 1000,
    initialLoading: false,
  };

  return (overrides?: { ttlMs?: number; initialLoading?: boolean }) => {
    const { data: response, ...rest } = useCachedApi(apiFunction, { ...config, ...overrides });
    const tags = useMemo(() => response?.tags || [], [response]);

    return { tags, ...rest };
  };
})();

export { useAutoTagsAPI };
