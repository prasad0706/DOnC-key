/**
 * Custom error classes for consistent error handling across the application.
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super(message, 400);
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError
};
