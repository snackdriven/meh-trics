import { APIError } from "encore.dev/api";

export enum ErrorCode {
  // Database errors
  DATABASE_CONNECTION_FAILED = "database_connection_failed",
  QUERY_TIMEOUT = "query_timeout",
  CONSTRAINT_VIOLATION = "constraint_violation",

  // Business logic errors
  INVALID_HABIT_FREQUENCY = "invalid_habit_frequency",
  TASK_NOT_FOUND = "task_not_found",
  HABIT_ALREADY_EXISTS = "habit_already_exists",

  // Validation errors
  INVALID_DATE_RANGE = "invalid_date_range",
  MISSING_REQUIRED_FIELD = "missing_required_field",
  INVALID_SORT_ORDER = "invalid_sort_order",

  // System errors
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SERVICE_UNAVAILABLE = "service_unavailable",
}

interface ErrorContext {
  operation?: string;
  entityId?: number;
  entityType?: string;
  userId?: string;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Creates standardized API errors with context and recovery suggestions
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  context?: ErrorContext,
  cause?: Error
): APIError {
  const enhancedMessage = enhanceErrorMessage(code, message, context);

  // Log error for monitoring
  console.error(`[${code}] ${enhancedMessage}`, {
    context,
    cause: cause?.message,
    stack: cause?.stack,
  });

  return APIError.internal(enhancedMessage);
}

/**
 * Enhance error messages with context and suggestions
 */
function enhanceErrorMessage(code: ErrorCode, message: string, context?: ErrorContext): string {
  const suggestions = getRecoverySuggestions(code);
  let enhanced = message;

  if (context?.operation) {
    enhanced = `${context.operation}: ${enhanced}`;
  }

  if (suggestions.length > 0) {
    enhanced += ` Suggestions: ${suggestions.join(", ")}`;
  }

  return enhanced;
}

/**
 * Get recovery suggestions based on error code
 */
function getRecoverySuggestions(code: ErrorCode): string[] {
  const suggestions: Record<ErrorCode, string[]> = {
    [ErrorCode.DATABASE_CONNECTION_FAILED]: [
      "ensure PostgreSQL is running",
      "check connection string",
      "verify network connectivity",
    ],
    [ErrorCode.QUERY_TIMEOUT]: [
      "try with smaller date range",
      "add appropriate indexes",
      "consider pagination",
    ],
    [ErrorCode.TASK_NOT_FOUND]: [
      "verify the task ID exists",
      "check if task was deleted",
      "refresh the task list",
    ],
    [ErrorCode.INVALID_DATE_RANGE]: [
      "ensure end date is after start date",
      "use ISO 8601 format",
      "check for timezone issues",
    ],
    [ErrorCode.RATE_LIMIT_EXCEEDED]: [
      "wait before retrying",
      "implement exponential backoff",
      "contact support if persistent",
    ],
  };

  return suggestions[code] || [];
}

/**
 * Wraps database operations with enhanced error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw createAppError(ErrorCode.QUERY_TIMEOUT, "Database query timed out", context, error);
      }

      if (error.message.includes("connection")) {
        throw createAppError(
          ErrorCode.DATABASE_CONNECTION_FAILED,
          "Database connection failed",
          context,
          error
        );
      }

      if (error.message.includes("constraint")) {
        throw createAppError(
          ErrorCode.CONSTRAINT_VIOLATION,
          "Database constraint violation",
          context,
          error
        );
      }
    }

    // Re-throw if not a recognized database error
    throw error;
  }
}

/**
 * Middleware for request validation
 */
export function validateRequest<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  fieldName?: string
): T {
  if (!validator(data)) {
    throw createAppError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Invalid ${fieldName || "request data"}`,
      { additionalInfo: { received: data } }
    );
  }
  return data;
}
