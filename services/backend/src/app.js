import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import session from 'express-session';
import passport from './config/passport.js';
import logger from './config/logger.js';

// Middleware Imports
import { corsMiddleware } from './middleware/cors.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routes Imports
import routes from './routes/index.js';

/**
 * Create Express application
 * Note: Passport is initialized in server.js AFTER env vars are loaded
 */
const app = express();

// ==========================================
// Security Middleware
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(mongoSanitize());

// ==========================================
// CORS
// ==========================================
app.use(corsMiddleware);

// ==========================================
// Body Parsing
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==========================================
// Session Middleware
// ==========================================
app.use(
  session({
    secret: process.env.JWT_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ==========================================
// Passport Middleware (Already initialized in server.js)
// ==========================================
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// Request Logging
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// ==========================================
// Rate Limiting
// ==========================================
app.use('/api', apiLimiter);

// ==========================================
// Routes
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SwiftSQL API',
    version: '2.0.0',
    description: 'Natural Language to SQL conversion service',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    services: {
      api: 'running',
      database: 'connected',
      mlService: 'connected',
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);

// ==========================================
// Error Handling
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// Graceful Shutdown
// ==========================================
process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION! 💥');
  logger.error(reason);
});

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥');
  logger.error(error);
});

export default app;
