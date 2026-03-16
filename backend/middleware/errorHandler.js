const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Centralized error handling middleware.
 * Catches all errors thrown in route handlers and sends consistent JSON responses.
 */
function errorHandler(err, req, res, next) {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = `Validation failed: ${messages.join(', ')}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for: ${field}`;
  }

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 10MB.';
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map(d => d.message).join(', ');
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  } else {
    logger.warn('Client error', {
      error: message,
      statusCode,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = errorHandler;
