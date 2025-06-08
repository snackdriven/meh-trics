import { useCallback, useState } from "react";

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Wraps an async function with loading and error state management.
 *
 * Useful for React components that need to trigger asynchronous operations
 * and display their progress. The hook exposes `execute` which mirrors the
 * provided async function while tracking its status.
 *
 * @param asyncFunction The asynchronous function to invoke.
 * @param onSuccess Optional callback invoked with the resolved value.
 * @param onError Optional callback invoked when the operation throws.
 * @returns Helpers for running the async operation and inspecting state.
 */
export function useAsyncOperation<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void,
): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        onError?.(errorMessage);
        console.error("Async operation failed:", error);
        return null;
      }
    },
    [asyncFunction, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}
