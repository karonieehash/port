/**
 * Standard Application Error Types and Classes
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  CONFIG: 'CONFIGURATION_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_DENIED',
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {string} type
   * @param {any} [details]
   */
  constructor(message, type = ErrorTypes.UNKNOWN, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Normalizes any caught exception into an AppError
 * @param {Error|any} err
 * @returns {AppError}
 */
export function normalizeError(err) {
  if (err instanceof AppError) {
    return err;
  }
  const message = err?.message || String(err) || 'An unexpected error occurred.';
  if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network')) {
    return new AppError('Network connection failed. Please check your internet connection.', ErrorTypes.NETWORK, err);
  }
  if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('rls')) {
    return new AppError('Permission denied. Only the portfolio owner can edit.', ErrorTypes.PERMISSION, err);
  }
  if (message.toLowerCase().includes('schema') || message.toLowerCase().includes('validation')) {
    return new AppError(message, ErrorTypes.VALIDATION, err);
  }
  return new AppError(message, ErrorTypes.UNKNOWN, err);
}
