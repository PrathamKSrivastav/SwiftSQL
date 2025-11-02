import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import AppError from './utils/AppError.js';

// Import routes
import v1Routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// ==========================================
// Trust proxy
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// Security Middleware
// ==========================================

// Set security HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// ==========================================
// Routes
// ==========================================

// Auth routes (must be before v1Routes)
app.use('/api/v1/auth', authRoutes);

// All other API v1 routes
app.use('/api/v1', v1Routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SwiftSQL API',
    version: '2.0.0',
    endpoints: {
      docs: '/api/docs',
      health: '/health',
      api: '/api/v1',
    },
  });
});

// ==========================================
// 404 Error Handler
// ==========================================
app.all('*', (req, res, next) => {
  logger.error(`Route ${req.originalUrl} not found`);
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

// ==========================================
// Global Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode}: ${err.message}`);

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
});

export default app;
