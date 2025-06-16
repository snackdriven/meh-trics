/**
 * Performance Optimization Utilities
 *
 * Collection of utility functions and hooks to improve React performance
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Debounced callback hook
 * Useful for expensive operations like API calls or search
 */
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttled callback hook
 * Limits the rate at which a function can be called
 */
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const callbackRef = useRef(callback);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        callbackRef.current(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [delay]
  );
}

/**
 * Memoized selector hook
 * Prevents unnecessary re-renders when selecting data from larger objects
 */
export function useSelector<T, R>(
  data: T,
  selector: (data: T) => R,
  deps: React.DependencyList = []
): R {
  return useMemo(() => selector(data), [data, ...deps]);
}

/**
 * Stable callback array hook
 * Ensures callback array reference stability for dependency arrays
 */
export function useStableCallbacks<T extends Record<string, (...args: any[]) => any>>(
  callbacks: T
): T {
  const stableCallbacks = useRef<T>({} as T);

  // Update individual callbacks while maintaining object reference
  Object.entries(callbacks).forEach(([key, callback]) => {
    if (stableCallbacks.current[key as keyof T] !== callback) {
      stableCallbacks.current[key as keyof T] = callback;
    }
  });

  return stableCallbacks.current;
}

/**
 * Previous value hook
 * Useful for comparing current vs previous values in effects
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

/**
 * Intersection Observer hook for lazy loading
 * Useful for implementing virtualization or lazy image loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Efficient array differ
 * Compares two arrays and returns only the changes
 */
export function useArrayDiff<T>(
  currentArray: T[],
  keyExtractor: (item: T) => string | number = (_item, index) => index
) {
  const previousArray = usePrevious(currentArray);

  return useMemo(() => {
    if (!previousArray) {
      return {
        added: currentArray,
        removed: [],
        updated: [],
        unchanged: [],
      };
    }

    const currentMap = new Map(currentArray.map((item) => [keyExtractor(item), item]));
    const previousMap = new Map(previousArray.map((item) => [keyExtractor(item), item]));

    const added: T[] = [];
    const removed: T[] = [];
    const updated: T[] = [];
    const unchanged: T[] = [];

    // Find added and updated items
    currentArray.forEach((current) => {
      const key = keyExtractor(current);
      const previous = previousMap.get(key);

      if (!previous) {
        added.push(current);
      } else if (JSON.stringify(current) !== JSON.stringify(previous)) {
        updated.push(current);
      } else {
        unchanged.push(current);
      }
    });

    // Find removed items
    previousArray.forEach((previous) => {
      const key = keyExtractor(previous);
      if (!currentMap.has(key)) {
        removed.push(previous);
      }
    });

    return { added, removed, updated, unchanged };
  }, [currentArray, previousArray, keyExtractor]);
}

/**
 * Performance measurement hook
 * Useful for identifying rendering bottlenecks
 */
export function usePerformanceMonitor(componentName: string, enabled = false) {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (!enabled || !renderStartTime.current) return;

    const renderTime = performance.now() - renderStartTime.current;

    if (renderTime > 16) {
      // More than one frame (16ms)
      console.warn(
        `${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
      );
    }
  });

  return { renderCount: renderCount.current };
}

/**
 * Optimized event handlers factory
 * Creates memoized event handlers for collections
 */
export function useEventHandlers<T>(
  items: T[],
  keyExtractor: (item: T) => string | number,
  handlers: Record<string, (item: T, ...args: any[]) => void>
) {
  return useMemo(() => {
    const handlerMap = new Map<string | number, Record<string, (...args: any[]) => void>>();

    items.forEach((item) => {
      const key = keyExtractor(item);
      const itemHandlers: Record<string, (...args: any[]) => void> = {};

      Object.entries(handlers).forEach(([handlerName, handler]) => {
        itemHandlers[handlerName] = (...args: any[]) => handler(item, ...args);
      });

      handlerMap.set(key, itemHandlers);
    });

    return handlerMap;
  }, [items, keyExtractor, handlers]);
}

/**
 * Smart loading state hook
 * Prevents loading flickering for fast operations
 */
export function useSmartLoading(loading: boolean, minLoadingTime = 300) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const loadingStartTime = useRef<number>();

  useEffect(() => {
    if (loading) {
      loadingStartTime.current = Date.now();
      setShouldShowLoading(true);
    } else if (loadingStartTime.current) {
      const elapsed = Date.now() - loadingStartTime.current;

      if (elapsed < minLoadingTime) {
        setTimeout(() => setShouldShowLoading(false), minLoadingTime - elapsed);
      } else {
        setShouldShowLoading(false);
      }
    }
  }, [loading, minLoadingTime]);

  return shouldShowLoading;
}

/**
 * Memoization utilities for complex objects
 */
export const memoUtils = {
  /**
   * Shallow comparison for objects
   */
  shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => a[key] === b[key]);
  },

  /**
   * Memoize function with custom equality check
   */
  memoizeWithCustomEqual<TArgs extends readonly unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    equalityCheck: (a: TArgs, b: TArgs) => boolean
  ) {
    let lastArgs: TArgs | undefined;
    let lastResult: TReturn;

    return (...args: TArgs): TReturn => {
      if (!lastArgs || !equalityCheck(args, lastArgs)) {
        lastArgs = args;
        lastResult = fn(...args);
      }
      return lastResult;
    };
  },
};

/**
 * Example usage patterns:
 *
 * ```typescript
 * // Debounced search
 * const debouncedSearch = useDebounce(searchFunction, 300);
 *
 * // Throttled scroll handler
 * const throttledScroll = useThrottle(handleScroll, 16);
 *
 * // Efficient data selection
 * const selectedData = useSelector(
 *   largeDataObject,
 *   data => data.specificProperty,
 *   [data.version] // Additional dependencies
 * );
 *
 * // Performance monitoring
 * usePerformanceMonitor('ExpensiveComponent', __DEV__);
 *
 * // Smart loading state
 * const showSpinner = useSmartLoading(isLoading, 300);
 * ```
 */
