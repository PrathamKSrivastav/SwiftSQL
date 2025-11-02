import express from 'express';
import { body, param } from 'express-validator';
import * as databaseController from '../controllers/database.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/database/connections
 * @desc    Save new database connection
 * @access  Private
 */
router.post(
  '/connections',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Connection name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be less than 100 characters'),
    
    body('host')
      .trim()
      .notEmpty()
      .withMessage('Host is required'),
    
    body('port')
      .optional()
      .isInt({ min: 1, max: 65535 })
      .withMessage('Port must be between 1 and 65535'),
    
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    body('database')
      .trim()
      .notEmpty()
      .withMessage('Database name is required'),
    
    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean'),
  ],
  validate,
  databaseController.saveConnection
);

/**
 * @route   GET /api/v1/database/connections
 * @desc    Get all saved connections
 * @access  Private
 */
router.get('/connections', databaseController.getConnections);

/**
 * @route   GET /api/v1/database/connections/:id
 * @desc    Get single connection by ID
 * @access  Private
 */
router.get(
  '/connections/:id',
  [param('id').isMongoId().withMessage('Invalid connection ID')],
  validate,
  databaseController.getConnection
);

/**
 * @route   PATCH /api/v1/database/connections/:id
 * @desc    Update connection
 * @access  Private
 */
router.patch(
  '/connections/:id',
  [
    param('id').isMongoId().withMessage('Invalid connection ID'),
    body('name').optional().trim().notEmpty(),
    body('host').optional().trim().notEmpty(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
    body('username').optional().trim().notEmpty(),
    body('password').optional().notEmpty(),
    body('database').optional().trim().notEmpty(),
    body('isDefault').optional().isBoolean(),
  ],
  validate,
  databaseController.updateConnection
);

/**
 * @route   DELETE /api/v1/database/connections/:id
 * @desc    Delete connection
 * @access  Private
 */
router.delete(
  '/connections/:id',
  [param('id').isMongoId().withMessage('Invalid connection ID')],
  validate,
  databaseController.deleteConnection
);

/**
 * @route   GET /api/v1/database/connections/:id/tables
 * @desc    List tables in database
 * @access  Private
 */
router.get(
  '/connections/:id/tables',
  [param('id').isMongoId().withMessage('Invalid connection ID')],
  validate,
  databaseController.listTables
);

/**
 * @route   GET /api/v1/database/connections/:id/tables/:tableName
 * @desc    Get table schema
 * @access  Private
 */
router.get(
  '/connections/:id/tables/:tableName',
  [
    param('id').isMongoId().withMessage('Invalid connection ID'),
    param('tableName').trim().notEmpty().withMessage('Table name is required'),
  ],
  validate,
  databaseController.getTableSchema
);

export default router;
