const errorHandler = (err, req, res, next) => {
  console.error('========== ERROR HANDLER ==========');
  console.error('Error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  if (err.original) {
    console.error('Original error:', err.original);
  }
  console.error('===================================');

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    console.error('Database error details:', err.original);
    return res.status(500).json({ 
      error: 'Database error',
      message: err.message || 'A database error occurred. Please check your database connection and configuration.',
      ...(process.env.NODE_ENV === 'development' && { details: err.original?.message })
    });
  }

  // Sequelize connection errors
  if (err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionError') {
    return res.status(503).json({ 
      error: 'Database connection failed',
      message: 'Unable to connect to the database. Please ensure PostgreSQL is running and the connection settings are correct.'
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: 'Duplicate entry', 
      message: 'A record with this value already exists',
      field: err.errors?.[0]?.path
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ 
      error: 'Invalid reference', 
      message: 'Referenced record does not exist' 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name,
      details: err.original?.message || err.message
    })
  });
};

module.exports = errorHandler;

