/**
 * Global error handler middleware
 * Catches all errors and sends consistent error responses
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('errorHandler - Error:', err);

  // Default error status and message
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Database Error',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred while processing your request' : err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Authentication token is invalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Authentication token has expired',
    });
  }

  // Default error response
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
};
