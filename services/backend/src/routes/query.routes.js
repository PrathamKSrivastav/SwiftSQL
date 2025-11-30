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
 * @route POST /api/v1/query/convert
 * @desc Convert natural language to SQL
 * @access Private
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
 * @route POST /api/v1/query/execute
 * @desc Execute SQL query using saved connection
 * @access Private
 */
router.post(
  '/execute',
  queryLimiter,
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('SQL query is required'),
    body('connectionId')
      .notEmpty()
      .withMessage('Connection ID is required'),
    body('naturalLanguage')
      .optional()
      .trim(),
  ],
  validate,
  queryController.executeSQL
);

/**
 * @route GET /api/v1/query/history
 * @desc Get query history
 * @access Private
 */
router.get('/history', queryController.getQueryHistory);

/**
 * @route DELETE /api/v1/query/history/:id
 * @desc Delete query from history
 * @access Private
 */
router.delete('/history/:id', queryController.deleteQueryHistory);

export default router;
