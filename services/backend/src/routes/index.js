import express from 'express';
import authRoutes from './auth.routes.js';
import queryRoutes from './query.routes.js';
import databaseRoutes from './database.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

/**
 * API v1 Routes
 */
router.use('/auth', authRoutes);
router.use('/query', queryRoutes);
router.use('/database', databaseRoutes);
router.use('/user', userRoutes);

/**
 * Health check route
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SwiftSQL API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * API info route
 */
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'SwiftSQL API',
    version: '2.0.0',
    description: 'Natural Language to SQL conversion API',
    endpoints: {
      auth: '/api/v1/auth',
      query: '/api/v1/query',
      database: '/api/v1/database',
      user: '/api/v1/user',
      health: '/api/v1/health',
    },
  });
});

export default router;
