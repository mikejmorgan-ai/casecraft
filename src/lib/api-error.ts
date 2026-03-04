/**
 * API Error handling utilities for CaseBrake.ai
 * Provides standardized error handling for API responses
 */

/**
 * Standard error codes used throughout the application
 */
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',
  CASE_NOT_FOUND: 'CASE_NOT_FOUND',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * User-friendly error messages for each error code
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Your account does not have sufficient permissions.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.CASE_NOT_FOUND]: 'The specified case could not be found.',
  [ErrorCodes.DOCUMENT_NOT_FOUND]: 'The specified document could not be found.',
  [ErrorCodes.AGENT_NOT_FOUND]: 'The specified agent could not be found.',
  [ErrorCodes.CONVERSATION_NOT_FOUND]: 'The specified conversation could not be found.',
  [ErrorCodes.CONFLICT]: 'A conflict occurred. The resource may already exist.',
  [ErrorCodes.DUPLICATE_ENTRY]: 'This item already exists.',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'An external service is currently unavailable.',
}

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string
  message: string
  code?: string
}

/**
 * API Error response structure
 */
export interface ApiErrorResponse {
  error: string
  code?: ErrorCode
  message?: string
  details?: string
  fieldErrors?: FieldError[]
  timestamp?: string
}

/**
 * Custom API Error class extending Error
 * Provides structured error information for API responses
 */
export class ApiError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly fieldErrors?: FieldError[]
  public readonly details?: string
  public readonly timestamp: string

  constructor(
    message: string,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    statusCode: number = 500,
    options?: {
      fieldErrors?: FieldError[]
      details?: string
    }
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.fieldErrors = options?.fieldErrors
    this.details = options?.details
    this.timestamp = new Date().toISOString()

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Convert to a JSON-serializable response object
   */
  toResponse(): ApiErrorResponse {
    return {
      error: this.message,
      code: this.code,
      message: ErrorMessages[this.code] || this.message,
      details: this.details,
      fieldErrors: this.fieldErrors,
      timestamp: this.timestamp,
    }
  }

  /**
   * Create an ApiError from a standard Error
   */
  static fromError(error: Error, code: ErrorCode = ErrorCodes.INTERNAL_ERROR): ApiError {
    if (error instanceof ApiError) {
      return error
    }
    return new ApiError(error.message, code, 500)
  }

  /**
   * Factory methods for common error types
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, ErrorCodes.UNAUTHORIZED, 401)
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, ErrorCodes.FORBIDDEN, 403)
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(`${resource} not found`, ErrorCodes.NOT_FOUND, 404)
  }

  static validation(message: string, fieldErrors?: FieldError[]): ApiError {
    return new ApiError(message, ErrorCodes.VALIDATION_ERROR, 400, { fieldErrors })
  }

  static conflict(message = 'Resource already exists'): ApiError {
    return new ApiError(message, ErrorCodes.CONFLICT, 409)
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, ErrorCodes.INTERNAL_ERROR, 500)
  }

  static rateLimit(message = 'Rate limit exceeded'): ApiError {
    return new ApiError(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429)
  }
}

/**
 * Parse an API response and extract error information
 */
export async function handleApiError(response: Response): Promise<ApiError> {
  let errorData: ApiErrorResponse

  try {
    errorData = await response.json()
  } catch {
    // Response body is not JSON
    errorData = {
      error: response.statusText || 'Unknown error',
    }
  }

  // Determine error code from status and response
  const code = errorData.code || getErrorCodeFromStatus(response.status)
  const message = errorData.message || errorData.error || ErrorMessages[code]

  return new ApiError(message, code, response.status, {
    fieldErrors: errorData.fieldErrors,
    details: errorData.details,
  })
}

/**
 * Get error code from HTTP status code
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR
    case 401:
      return ErrorCodes.UNAUTHORIZED
    case 403:
      return ErrorCodes.FORBIDDEN
    case 404:
      return ErrorCodes.NOT_FOUND
    case 409:
      return ErrorCodes.CONFLICT
    case 429:
      return ErrorCodes.RATE_LIMIT_EXCEEDED
    default:
      return ErrorCodes.INTERNAL_ERROR
  }
}

/**
 * Helper to fetch with automatic error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw await handleApiError(response)
  }

  return response.json()
}

/**
 * Get a user-friendly message for an error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Check if an error is a specific type
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.code === ErrorCodes.UNAUTHORIZED
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.code === ErrorCodes.VALIDATION_ERROR
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.code === ErrorCodes.NOT_FOUND
}
