const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const applicationRoutes = require('./routes/applications');
const universityRoutes = require('./routes/universities');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const ticketRoutes = require('./routes/tickets');
const faqRoutes = require('./routes/faqs');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'UniApply API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password'
      },
      applications: {
        list: 'GET /api/applications',
        get: 'GET /api/applications/:id',
        create: 'POST /api/applications',
        update: 'PUT /api/applications/:id',
        submit: 'POST /api/applications/:id/submit'
      },
      universities: {
        list: 'GET /api/universities',
        get: 'GET /api/universities/:id'
      },
      documents: {
        list: 'GET /api/documents',
        upload: 'POST /api/documents'
      },
      payments: {
        list: 'GET /api/payments',
        get: 'GET /api/payments/:id',
        create: 'POST /api/payments',
        createOrder: 'POST /api/payments/create-order',
        verify: 'POST /api/payments/verify',
        update: 'PUT /api/payments/:id'
      },
      tickets: {
        list: 'GET /api/tickets',
        create: 'POST /api/tickets'
      },
      faqs: {
        list: 'GET /api/faqs'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n📝 Please create a .env file in the backend directory with the required variables.');
      console.error('   See .env.example or SETUP.md for reference.\n');
      process.exit(1);
    }

    console.log('🔄 Attempting to connect to database...');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}\n`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models (in production, use migrations)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Synchronizing database models...');
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Database models synchronized.');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('\n❌ Unable to start server:\n');
    
    if (error.name === 'SequelizeConnectionRefusedError' || error.code === 'ECONNREFUSED') {
      console.error('   Database connection refused. Possible issues:');
      console.error('   1. PostgreSQL service is not running');
      console.error('   2. Database does not exist');
      console.error('   3. Wrong database credentials in .env file');
      console.error('   4. PostgreSQL is not installed\n');
      console.error('   Solutions:');
      console.error('   - Start PostgreSQL service: net start postgresql-x64-XX (Windows)');
      console.error('   - Create database: createdb uniapply_db');
      console.error('   - Check .env file has correct DB_USER and DB_PASSWORD\n');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('   Database access denied. Check:');
      console.error('   - DB_USER and DB_PASSWORD in .env file');
      console.error('   - PostgreSQL user permissions\n');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.error('   Full error details:', error.name);
    process.exit(1);
  }
}

startServer();

module.exports = app;

