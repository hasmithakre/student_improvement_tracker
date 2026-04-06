const errorHandler = (err, req, res, next) => {
  // Log full error for server debugging
  console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.originalUrl}`);
  console.error(`Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ message: 'Validation error', errors });
  }

  // Mongoose Duplicate Key Error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired, please login again' });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// 404 handler — attach before errorHandler in server.js
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
