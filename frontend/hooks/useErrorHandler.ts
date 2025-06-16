import { type AppError, ErrorCategory, createUserFriendlyError } from "@/lib/errorHandling";
import { useCallback } from "react";
import { useToast } from "./useToast";

/**
 * Hook for consistent error handling across the application
 */
export function useErrorHandler() {
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const appError = createUserFriendlyError(error);

      // Log error for debugging
      console.error(`Error${context ? ` in ${context}` : ""}:`, {
        error: appError.message,
        userMessage: appError.userMessage,
        category: appError.category,
        status: appError.status,
        code: appError.code,
      });

      // Show user-friendly toast notification
      const title = getErrorTitle(appError);
      const message = appError.userMessage || appError.message;

      showToast({
        variant: "destructive",
        title,
        description: message,
      });

      return appError;
    },
    [showToast]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncOperation: () => Promise<T>,
      context?: string,
      options?: {
        showToast?: boolean;
        customErrorHandler?: (error: AppError) => void;
      }
    ): Promise<T | null> => {
      try {
        return await asyncOperation();
      } catch (error) {
        const appError = handleError(error, context);

        if (options?.customErrorHandler) {
          options.customErrorHandler(appError);
        }

        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}

/**
 * Returns an appropriate error title based on the error category
 */
function getErrorTitle(error: AppError): string {
  switch (error.category) {
    case ErrorCategory.Network:
      return "Connection Error";
    case ErrorCategory.Client:
      return error.status === 404 ? "Not Found" : "Invalid Request";
    case ErrorCategory.Server:
      return "Server Error";
    default:
      return "Unexpected Error";
  }
}

/**
 * Hook for retrying failed operations with exponential backoff
 */
export function useRetry() {
  const { handleError } = useErrorHandler();

  const retry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      maxAttempts = 3,
      baseDelay = 1000,
      context?: string
    ): Promise<T | null> => {
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;

          // Don't retry client errors (4xx)
          const appError = createUserFriendlyError(error);
          if (
            appError.category === ErrorCategory.Client &&
            appError.status &&
            appError.status < 500
          ) {
            handleError(error, context);
            return null;
          }

          // Don't retry on the last attempt
          if (attempt === maxAttempts) {
            break;
          }

          // Wait before retrying with exponential backoff
          const delay = baseDelay * 2 ** (attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          console.log(
            `Retrying operation (attempt ${attempt + 1}/${maxAttempts}) after ${delay}ms`
          );
        }
      }

      // All attempts failed
      handleError(lastError, `${context} (after ${maxAttempts} attempts)`);
      return null;
    },
    [handleError]
  );

  return { retry };
}
