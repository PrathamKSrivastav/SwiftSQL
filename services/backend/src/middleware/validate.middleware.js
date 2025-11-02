import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validate request using express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, errorMessages.join('. '));
  }

  next();
};

/**
 * Sanitize request body
 * Remove any fields that start with $ or contain .
 */
export const sanitize = (req, res, next) => {
  const sanitizeObject = (obj) => {
    const sanitized = {};
    
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Skip potentially dangerous keys
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

// Export as default as well for flexibility
export default validate;
