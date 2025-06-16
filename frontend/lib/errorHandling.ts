export enum ErrorCategory {
  Network = "network",
  Client = "client",
  Server = "server",
  Unknown = "unknown",
}

export interface AppError extends Error {
  category: ErrorCategory;
  status?: number;
  userMessage?: string;
  details?: string;
  code?: string;
}

/**
 * Maps backend error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  RESOURCE_NOT_FOUND:
    "We couldn't find what you're looking for. It may have been deleted or moved.",
  RESOURCE_ALREADY_EXISTS: "This item already exists. Please try with different details.",
  INVALID_INPUT: "Please check your input and try again. Some fields may contain invalid values.",
  MISSING_REQUIRED_FIELD: "Please fill in all required fields and try again.",
  INVALID_DATE_RANGE: "Please check that your start date is before the end date.",
  INVALID_SORT_ORDER: "We couldn't reorder your items. Please try again.",
  RECURRING_TASK_LIMIT_EXCEEDED:
    "You've reached the limit for this recurring task this cycle. Try again next cycle.",
  HABIT_ALREADY_LOGGED:
    "You've already logged this habit for today. You can update your existing entry instead.",
  JOURNAL_ENTRY_CONFLICT:
    "There's a conflict with your journal entry. Please refresh and try again.",
  DATABASE_CONNECTION_ERROR:
    "We're having trouble connecting to our servers. Please try again in a moment.",
  DATABASE_CONSTRAINT_VIOLATION:
    "This action would violate data integrity rules. Please check your input.",
  DATABASE_TRANSACTION_FAILED: "We couldn't complete your request. Please try again.",
  CALENDAR_IMPORT_FAILED:
    "We couldn't import your calendar file. Please check the format and try again.",
  INTERNAL_SERVER_ERROR:
    "Something went wrong on our end. We're looking into it. Please try again later.",
  SERVICE_UNAVAILABLE:
    "This feature is temporarily unavailable. Please try again in a few minutes.",
};

/**
 * Creates a user-friendly error message from a backend error response
 */
export function createUserFriendlyError(error: unknown): AppError {
  if (error instanceof Error && "userMessage" in error) {
    const appError = error as AppError;
    return {
      ...appError,
      userMessage: appError.userMessage || appError.message,
    };
  }

  if (error instanceof Response) {
    const status = error.status;
    let category = ErrorCategory.Unknown;
    let userMessage = "An unexpected error occurred. Please try again.";

    if (status >= 400 && status < 500) {
      category = ErrorCategory.Client;
      userMessage =
        status === 404
          ? "We couldn't find what you're looking for."
          : "Please check your input and try again.";
    } else if (status >= 500) {
      category = ErrorCategory.Server;
      userMessage = "Something went wrong on our end. Please try again later.";
    }

    const appError = new Error(`Request failed with status ${status}`) as AppError;
    appError.category = category;
    appError.status = status;
    appError.userMessage = userMessage;
    return appError;
  }

  if (error instanceof Error) {
    let category = ErrorCategory.Unknown;
    let userMessage = "An unexpected error occurred. Please try again.";

    if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
      category = ErrorCategory.Network;
      userMessage =
        "We're having trouble connecting. Please check your internet connection and try again.";
    }

    const appError = error as AppError;
    appError.category = category;
    appError.userMessage = userMessage;
    return appError;
  }

  const appError = new Error(String(error)) as AppError;
  appError.category = ErrorCategory.Unknown;
  appError.userMessage = "An unexpected error occurred. Please try again.";
  return appError;
}

/**
 * Parses backend API error response and extracts user-friendly message
 */
export async function parseApiError(response: Response): Promise<AppError> {
  try {
    const errorData = await response.json();
    const code = errorData.code || errorData.error?.code;
    const userMessage =
      errorData.userMessage ||
      errorData.error?.userMessage ||
      (code && ERROR_MESSAGES[code]) ||
      errorData.message ||
      "An error occurred. Please try again.";

    const appError = new Error(errorData.message || `HTTP ${response.status}`) as AppError;
    appError.category = response.status >= 500 ? ErrorCategory.Server : ErrorCategory.Client;
    appError.status = response.status;
    appError.userMessage = userMessage;
    appError.code = code;
    appError.details = errorData.details;

    return appError;
  } catch {
    // Fallback if JSON parsing fails
    return createUserFriendlyError(response);
  }
}

/**
 * Enhanced fetch wrapper with retry logic and improved error handling.
 * Retries are only triggered for network errors or 5xx server responses.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3,
  backoffMs = 500
): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(input, init);
      if (response.ok) {
        return response;
      }

      // For server errors, retry if we have attempts left
      if (response.status >= 500 && attempt < retries) {
        await delay(backoffMs * 2 ** attempt);
        attempt++;
        continue;
      }

      // For all error responses, parse and throw with user-friendly message
      throw await parseApiError(response);
    } catch (e: unknown) {
      // Network errors - retry if we have attempts left
      if (e instanceof Error && (e.name === "TypeError" || e.message.includes("Failed to fetch"))) {
        if (attempt < retries) {
          await delay(backoffMs * 2 ** attempt);
          attempt++;
          continue;
        }
        throw createUserFriendlyError(e);
      }

      // Re-throw existing AppErrors
      if (e instanceof Error && "category" in e) {
        throw e;
      }

      // Convert unknown errors to AppError
      throw createUserFriendlyError(e);
    }
  }
}

/**
 * Wrapper for API calls that handles errors gracefully
 */
export async function apiCall<T>(apiFunction: () => Promise<T>, context?: string): Promise<T> {
  try {
    return await apiFunction();
  } catch (error) {
    const appError = createUserFriendlyError(error);

    // Log error with context for debugging
    console.error(`API Error${context ? ` in ${context}` : ""}:`, {
      error: appError.message,
      userMessage: appError.userMessage,
      category: appError.category,
      status: appError.status,
      code: appError.code,
    });

    throw appError;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
