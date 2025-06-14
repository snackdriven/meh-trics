import { APIError } from "encore.dev/api";

/**
 * Centralized error types and utilities for consistent error handling
 * across all backend services.
 */

export enum ErrorCode {
  // Resource errors
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  
  // Validation errors
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  INVALID_SORT_ORDER = "INVALID_SORT_ORDER",
  
  // Business logic errors
  RECURRING_TASK_LIMIT_EXCEEDED = "RECURRING_TASK_LIMIT_EXCEEDED",
  HABIT_ALREADY_LOGGED = "HABIT_ALREADY_LOGGED",
  JOURNAL_ENTRY_CONFLICT = "JOURNAL_ENTRY_CONFLICT",
  
  // Database errors
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  DATABASE_CONSTRAINT_VIOLATION = "DATABASE_CONSTRAINT_VIOLATION",
  DATABASE_TRANSACTION_FAILED = "DATABASE_TRANSACTION_FAILED",
  
  // External service errors
  CALENDAR_IMPORT_FAILED = "CALENDAR_IMPORT_FAILED",
  
  // System errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

interface ErrorDetails {
  code: ErrorCode;
  message: string;
  userMessage: string;
  httpStatus: number;
}

/**
 * Error code to user-friendly message mapping
 */
const ERROR_DETAILS: Record<ErrorCode, ErrorDetails> = {
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: "The requested resource was not found",
    userMessage: "We couldn't find what you're looking for. It may have been deleted or moved.",
    httpStatus: 404,
  },
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: {
    code: ErrorCode.RESOURCE_ALREADY_EXISTS,
    message: "A resource with these details already exists",
    userMessage: "This item already exists. Please try with different details.",
    httpStatus: 409,
  },
  [ErrorCode.INVALID_INPUT]: {
    code: ErrorCode.INVALID_INPUT,
    message: "The provided input is invalid",
    userMessage: "Please check your input and try again. Some fields may contain invalid values.",
    httpStatus: 400,
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    code: ErrorCode.MISSING_REQUIRED_FIELD,
    message: "A required field is missing",
    userMessage: "Please fill in all required fields and try again.",
    httpStatus: 400,
  },
  [ErrorCode.INVALID_DATE_RANGE]: {
    code: ErrorCode.INVALID_DATE_RANGE,
    message: "The provided date range is invalid",
    userMessage: "Please check that your start date is before the end date.",
    httpStatus: 400,
  },
  [ErrorCode.INVALID_SORT_ORDER]: {
    code: ErrorCode.INVALID_SORT_ORDER,
    message: "The sort order values are invalid",
    userMessage: "We couldn't reorder your items. Please try again.",
    httpStatus: 400,
  },
  [ErrorCode.RECURRING_TASK_LIMIT_EXCEEDED]: {
    code: ErrorCode.RECURRING_TASK_LIMIT_EXCEEDED,
    message: "Maximum recurring task occurrences exceeded for this cycle",
    userMessage: "You've reached the limit for this recurring task this cycle. Try again next cycle.",
    httpStatus: 429,
  },
  [ErrorCode.HABIT_ALREADY_LOGGED]: {
    code: ErrorCode.HABIT_ALREADY_LOGGED,
    message: "Habit entry already exists for this date",
    userMessage: "You've already logged this habit for today. You can update your existing entry instead.",
    httpStatus: 409,
  },
  [ErrorCode.JOURNAL_ENTRY_CONFLICT]: {
    code: ErrorCode.JOURNAL_ENTRY_CONFLICT,
    message: "Journal entry conflicts with existing data",
    userMessage: "There's a conflict with your journal entry. Please refresh and try again.",
    httpStatus: 409,
  },
  [ErrorCode.DATABASE_CONNECTION_ERROR]: {
    code: ErrorCode.DATABASE_CONNECTION_ERROR,
    message: "Failed to connect to database",
    userMessage: "We're having trouble connecting to our servers. Please try again in a moment.",
    httpStatus: 503,
  },
  [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: {
    code: ErrorCode.DATABASE_CONSTRAINT_VIOLATION,
    message: "Database constraint violation",
    userMessage: "This action would violate data integrity rules. Please check your input.",
    httpStatus: 400,
  },
  [ErrorCode.DATABASE_TRANSACTION_FAILED]: {
    code: ErrorCode.DATABASE_TRANSACTION_FAILED,
    message: "Database transaction failed",
    userMessage: "We couldn't complete your request. Please try again.",
    httpStatus: 500,
  },
  [ErrorCode.CALENDAR_IMPORT_FAILED]: {
    code: ErrorCode.CALENDAR_IMPORT_FAILED,
    message: "Failed to import calendar events",
    userMessage: "We couldn't import your calendar file. Please check the format and try again.",
    httpStatus: 400,
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "An internal server error occurred",
    userMessage: "Something went wrong on our end. We're looking into it. Please try again later.",
    httpStatus: 500,
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: "Service is temporarily unavailable",
    userMessage: "This feature is temporarily unavailable. Please try again in a few minutes.",
    httpStatus: 503,
  },
};

/**
 * Creates a standardized API error with consistent structure
 */
export function createAppError(
  errorCode: ErrorCode,
  details?: string,
  cause?: Error
): APIError {
  const errorInfo = ERROR_DETAILS[errorCode];
  const message = details ? `${errorInfo.message}: ${details}` : errorInfo.message;
  
  const error = new APIError(errorInfo.httpStatus, errorCode, message, { 
    userMessage: errorInfo.userMessage,
    details: details || undefined,
    timestamp: new Date().toISOString(),
  });

  if (cause) {
    console.error(`[${errorCode}] ${message}`, { cause, stack: cause.stack });
  } else {
    console.error(`[${errorCode}] ${message}`);
  }

  return error;
}

/**
 * Handles database constraint violations and maps them to user-friendly errors
 */
export function handleDatabaseError(error: unknown, context?: string): APIError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextInfo = context ? ` in ${context}` : "";

  // Common PostgreSQL constraint violations
  if (errorMessage.includes("unique constraint") || errorMessage.includes("duplicate key")) {
    return createAppError(
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      `Duplicate entry${contextInfo}`,
      error instanceof Error ? error : undefined
    );
  }

  if (errorMessage.includes("foreign key constraint")) {
    return createAppError(
      ErrorCode.DATABASE_CONSTRAINT_VIOLATION,
      `Related record not found${contextInfo}`,
      error instanceof Error ? error : undefined
    );
  }

  if (errorMessage.includes("not null constraint")) {
    return createAppError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Required field missing${contextInfo}`,
      error instanceof Error ? error : undefined
    );
  }

  if (errorMessage.includes("connection") || errorMessage.includes("timeout")) {
    return createAppError(
      ErrorCode.DATABASE_CONNECTION_ERROR,
      `Database connection issue${contextInfo}`,
      error instanceof Error ? error : undefined
    );
  }

  // Default to internal server error for unknown database issues
  return createAppError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    `Database operation failed${contextInfo}`,
    error instanceof Error ? error : undefined
  );
}

/**
 * Validates required fields and throws appropriate error if missing
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(
    field => data[field] === undefined || data[field] === null || data[field] === ""
  );

  if (missingFields.length > 0) {
    throw createAppError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }
}

/**
 * Validates date range (start before end) and throws appropriate error if invalid
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate >= endDate) {
    throw createAppError(
      ErrorCode.INVALID_DATE_RANGE,
      "Start date must be before end date"
    );
  }
}

/**
 * Safely wraps async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // If it's already an APIError, re-throw it
    if (error instanceof APIError) {
      throw error;
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes("database")) {
      throw handleDatabaseError(error, context);
    }

    // Handle other known error patterns
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        throw createAppError(ErrorCode.RESOURCE_NOT_FOUND, `Resource not found in ${context}`, error);
      }
      
      if (error.message.includes("invalid") || error.message.includes("validation")) {
        throw createAppError(ErrorCode.INVALID_INPUT, `Invalid input in ${context}`, error);
      }
    }

    // Default to internal server error
    throw createAppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      `Unexpected error in ${context}`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}