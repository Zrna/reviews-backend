import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: number;
  errors?: { path: string; message: string }[];
}

/**
 * Global error handler middleware
 * Catches all errors and sends consistent error responses
 */

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  // Log the error for debugging (include request ID and user ID for tracing)
  const userId = req.userId || 'anonymous';
  logger.error({ err, requestId: req.id, userId }, 'errorHandler - An error occurred');

  // Default error status and message
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      requestId: req.id,
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      requestId: req.id,
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Database Error',
      requestId: req.id,
      message: process.env.NODE_ENV === 'production' ? 'An error occurred while processing your request' : err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      requestId: req.id,
      message: 'Authentication token is invalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      requestId: req.id,
      message: 'Authentication token has expired',
    });
  }

  // Default error response
  return res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
    requestId: req.id,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export { errorHandler };
