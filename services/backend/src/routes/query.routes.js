import express from 'express';
import { body } from 'express-validator';
import * as queryController from '../controllers/query.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { queryLimiter, mlLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/query/convert
 * @desc    Convert natural language to SQL
 * @access  Private
 */
router.post(
  '/convert',
  mlLimiter,
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('Query is required')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Query must be between 3 and 1000 characters'),
  ],
  validate,
  queryController.convertToSQL
);

/**
 * @route   POST /api/v1/query/execute
 * @desc    Execute SQL query
 * @access  Private
 */
router.post(
  '/execute',
  queryLimiter,
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('SQL query is required'),
    
    body('database')
      .isObject()
      .withMessage('Database connection details are required'),
    
    body('database.host')
      .trim()
      .notEmpty()
      .withMessage('Database host is required'),
    
    body('database.username')
      .trim()
      .notEmpty()
      .withMessage('Database username is required'),
    
    body('database.password')
      .notEmpty()
      .withMessage('Database password is required'),
    
    body('database.database')
      .trim()
      .notEmpty()
      .withMessage('Database name is required'),
    
    body('naturalLanguage')
      .optional()
      .trim(),
  ],
  validate,
  queryController.executeSQL
);

/**
 * @route   POST /api/v1/query/test-connection
 * @desc    Test MySQL connection
 * @access  Private
 */
router.post(
  '/test-connection',
  [
    body('host').trim().notEmpty().withMessage('Host is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('database').trim().notEmpty().withMessage('Database name is required'),
    body('port').optional().isInt({ min: 1, max: 65535 }),
  ],
  validate,
  queryController.testConnection
);

/**
 * @route   GET /api/v1/query/history
 * @desc    Get query history
 * @access  Private
 */
router.get('/history', queryController.getQueryHistory);

/**
 * @route   DELETE /api/v1/query/history/:id
 * @desc    Delete query from history
 * @access  Private
 */
router.delete('/history/:id', queryController.deleteQueryHistory);

export default router;
