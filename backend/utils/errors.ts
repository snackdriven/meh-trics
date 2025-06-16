import { APIError } from "encore.dev/api";

/**
 * Centralized error handling system for the meh-trics application.
 *
 * This module provides:
 * - Standardized error codes across all services
 * - User-friendly error message mapping
 * - Consistent API error structure with proper HTTP status codes
 * - Database error parsing and transformation
 * - Validation utilities for common patterns
 *
 * Design principles:
 * - Every error has both technical and user-friendly messages
 * - Error codes are service-agnostic and categorized by type
 * - HTTP status codes follow REST conventions
 * - All errors are logged with context for debugging
 *
 * @fileoverview Centralized error handling utilities
 * @version 1.0.0
 */

/**
 * Standardized error codes used throughout the application.
 *
 * Categories:
 * - Resource: Not found, already exists
 * - Validation: Input validation failures
 * - Business Logic: Application-specific rules violations
 * - Database: Connection, constraint, transaction failures
 * - External: Third-party service integration failures
 * - System: Internal server errors, service unavailable
 */
export enum ErrorCode {
  // === Resource Errors ===
  /** Requested resource (task, habit, etc.) was not found */
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  /** Attempted to create a resource that already exists */
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // === Validation Errors ===
  /** User input failed validation rules */
  INVALID_INPUT = "INVALID_INPUT",
  /** Required field was missing or empty */
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  /** Date range validation failed (start > end, etc.) */
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  /** Task reordering operation failed validation */
  INVALID_SORT_ORDER = "INVALID_SORT_ORDER",

  // === Business Logic Errors ===
  /** User exceeded max occurrences for a recurring task cycle */
  RECURRING_TASK_LIMIT_EXCEEDED = "RECURRING_TASK_LIMIT_EXCEEDED",
  /** Attempt to log habit entry that already exists for the date */
  HABIT_ALREADY_LOGGED = "HABIT_ALREADY_LOGGED",
  /** Journal entry conflicts with existing data */
  JOURNAL_ENTRY_CONFLICT = "JOURNAL_ENTRY_CONFLICT",

  // === Database Errors ===
  /** Failed to connect to database */
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  /** Database constraint violation (FK, unique, etc.) */
  DATABASE_CONSTRAINT_VIOLATION = "DATABASE_CONSTRAINT_VIOLATION",
  /** Database transaction failed to commit */
  DATABASE_TRANSACTION_FAILED = "DATABASE_TRANSACTION_FAILED",

  // === External Service Errors ===
  /** Calendar import (.ics file) processing failed */
  CALENDAR_IMPORT_FAILED = "CALENDAR_IMPORT_FAILED",

  // === System Errors ===
  /** Unexpected internal server error */
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  /** Service temporarily unavailable (maintenance, overload) */
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

/**
 * Structured error information containing both technical and user-facing details.
 */
interface ErrorDetails {
  /** The error code for programmatic handling */
  code: ErrorCode;
  /** Technical message for developers and logs */
  message: string;
  /** User-friendly message safe to display in UI */
  userMessage: string;
  /** HTTP status code following REST conventions */
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
    userMessage:
      "You've reached the limit for this recurring task this cycle. Try again next cycle.",
    httpStatus: 429,
  },
  [ErrorCode.HABIT_ALREADY_LOGGED]: {
    code: ErrorCode.HABIT_ALREADY_LOGGED,
    message: "Habit entry already exists for this date",
    userMessage:
      "You've already logged this habit for today. You can update your existing entry instead.",
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
 * Creates a standardized API error with consistent structure and automatic logging.
 *
 * This is the primary function for creating errors throughout the application.
 * It ensures all errors follow the same format and include both technical and
 * user-friendly messages.
 *
 * Features:
 * - Maps error codes to predefined error details
 * - Automatically sets appropriate HTTP status codes
 * - Includes timestamp for error tracking
 * - Logs errors with structured format for debugging
 * - Supports error chaining with original cause
 *
 * @param errorCode - Standardized error code from ErrorCode enum
 * @param details - Optional additional context about the specific error instance
 * @param cause - Optional original error that caused this error (for error chaining)
 * @returns APIError instance ready to be thrown by endpoint handlers
 *
 * @example
 * ```typescript
 * // Simple error
 * throw createAppError(ErrorCode.RESOURCE_NOT_FOUND);
 *
 * // Error with context
 * throw createAppError(
 *   ErrorCode.INVALID_INPUT,
 *   "Task title must be between 1 and 255 characters"
 * );
 *
 * // Error with original cause
 * try {
 *   await database.query(...);
 * } catch (dbError) {
 *   throw createAppError(
 *     ErrorCode.DATABASE_CONNECTION_ERROR,
 *     "Failed to fetch user tasks",
 *     dbError
 *   );
 * }
 * ```
 */
export function createAppError(errorCode: ErrorCode, details?: string, cause?: Error): APIError {
  const errorInfo = ERROR_DETAILS[errorCode];
  const message = details ? `${errorInfo.message}: ${details}` : errorInfo.message;

  // Create Encore APIError with structured metadata
  const error = new APIError(errorCode as ErrorCode, message, {
    userMessage: errorInfo.userMessage,
    details: details || undefined,
    timestamp: new Date().toISOString(),
  });

  // Log error with appropriate detail level
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
    (field) => data[field] === undefined || data[field] === null || data[field] === ""
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
    throw createAppError(ErrorCode.INVALID_DATE_RANGE, "Start date must be before end date");
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
        throw createAppError(
          ErrorCode.RESOURCE_NOT_FOUND,
          `Resource not found in ${context}`,
          error
        );
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

/**
 * Validates email format and throws error if invalid
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createAppError(ErrorCode.INVALID_INPUT, "Invalid email format");
  }
}

/**
 * Validates URL format and throws error if invalid
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw createAppError(ErrorCode.INVALID_INPUT, "Invalid URL format");
  }
}

/**
 * Type guard to check if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Extracts a consistent error response structure from an error
 */
export function getErrorResponse(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle other known error types
  if (error instanceof Error) {
    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}
