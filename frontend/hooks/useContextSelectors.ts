/**
 * Context Selectors for Fine-grained Performance Optimization
 *
 * This module provides context selectors to prevent unnecessary re-renders
 * by allowing components to subscribe only to specific parts of context state.
 */

import React, { useContext, useMemo, useRef, useSyncExternalStore } from "react";

// ============================================
// Generic Context Selector Hook
// ============================================

interface SelectorStore<T> {
  getSnapshot: () => T;
  subscribe: (callback: () => void) => () => void;
}

/**
 * Create a context selector that only re-renders when selected data changes
 */
export function useContextSelector<T, Selected>(
  store: SelectorStore<T>,
  selector: (state: T) => Selected
): Selected {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSnapshot = useMemo(() => () => selectorRef.current(store.getSnapshot()), [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

// ============================================
// Selector Store Creator
// ============================================

export function createSelectorStore<T>(initialState: T): {
  store: SelectorStore<T>;
  setState: (newState: T | ((prev: T) => T)) => void;
  getState: () => T;
} {
  let state = initialState;
  const listeners = new Set<() => void>();

  const store: SelectorStore<T> = {
    getSnapshot: () => state,
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };

  const setState = (newState: T | ((prev: T) => T)) => {
    const nextState =
      typeof newState === "function" ? (newState as (prev: T) => T)(state) : newState;

    if (nextState !== state) {
      state = nextState;
      listeners.forEach((listener) => listener());
    }
  };

  const getState = () => state;

  return { store, setState, getState };
}

// ============================================
// Optimized Context Pattern
// ============================================

interface OptimizedContextValue<T> {
  store: SelectorStore<T>;
  actions: Record<string, (...args: any[]) => void>;
}

/**
 * Create an optimized context with built-in selector support
 */
export function createOptimizedContext<
  T,
  Actions extends Record<string, (...args: any[]) => void>,
>() {
  const Context = React.createContext<OptimizedContextValue<T> | null>(null);

  function useSelector<Selected>(selector: (state: T) => Selected): Selected {
    const context = useContext(Context);
    if (!context) {
      throw new Error("useSelector must be used within context provider");
    }

    return useContextSelector(context.store, selector);
  }

  function useActions(): Actions {
    const context = useContext(Context);
    if (!context) {
      throw new Error("useActions must be used within context provider");
    }

    return context.actions as Actions;
  }

  return {
    Context,
    useSelector,
    useActions,
  };
}

// ============================================
// Today Context Selectors (Example Usage)
// ============================================

// These would integrate with the existing TodayContext
export const todaySelectors = {
  // Select only habits data
  habits: (state: any) => state.habits,

  // Select only tasks data
  tasks: (state: any) => state.tasks,

  // Select only loading state
  isLoading: (state: any) => state.isLoading,

  // Select specific habit by ID
  habitById: (habitId: number) => (state: any) => state.habits?.find((h: any) => h.id === habitId),

  // Select habit completion status
  habitCompletions: (state: any) =>
    state.habits?.reduce((acc: any, habit: any) => {
      acc[habit.id] = (state.habitCounts?.[habit.id] || 0) >= habit.targetCount;
      return acc;
    }, {}),

  // Select UI state
  collapsedState: (state: any) => state.ui?.collapsed || {},

  // Select settings
  settings: (state: any) => state.settings,
};

// ============================================
// Memoization Helpers
// ============================================

/**
 * Stable reference memoization for object values
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);

  // Simple equality check - for complex objects, consider deep equality
  if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Stable callback memoization with dependency checking
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Check if dependencies changed
  const depsChanged = !deps.every((dep, i) => dep === depsRef.current[i]);

  if (depsChanged) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return callbackRef.current;
}

// ============================================
// Performance Debug Helpers
// ============================================

/**
 * Hook to debug why a component re-rendered
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const prevProps = useRef<Record<string, any>>();

  React.useEffect(() => {
    if (prevProps.current) {
      const changedProps: Record<string, any> = {};

      Object.keys(props).forEach((key) => {
        if (prevProps.current?.[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current?.[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[WhyDidYouUpdate] ${name} re-rendered because:`, changedProps);
      }
    }

    prevProps.current = props;
  });
}

/**
 * Hook to track render count
 */
export function useRenderCount(name: string) {
  const renderCount = useRef(0);
  renderCount.current++;

  React.useEffect(() => {
    console.log(`[RenderCount] ${name} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}
