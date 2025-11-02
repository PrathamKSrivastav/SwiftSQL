import { body, param, query } from 'express-validator';

/**
 * Email validation
 */
export const validateEmail = () => {
  return body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail();
};

/**
 * Password validation
 */
export const validatePassword = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter');
};

/**
 * MongoDB ObjectId validation
 */
export const validateObjectId = (field = 'id') => {
  return param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`);
};

/**
 * Query string validation
 */
export const validateQuery = () => {
  return body('query')
    .trim()
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Query must be between 3 and 1000 characters');
};

/**
 * Database connection validation
 */
export const validateDatabaseConnection = () => {
  return [
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
  ];
};

/**
 * Pagination validation
 */
export const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];
};
