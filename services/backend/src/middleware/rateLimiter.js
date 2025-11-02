import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    throw new ApiError(429, options.message);
  },
});

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    throw new ApiError(429, options.message);
  },
});

/**
 * Rate limiter for query execution
 */
export const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 queries per minute
  message: 'Too many queries executed, please slow down.',
  handler: (req, res, next, options) => {
    throw new ApiError(429, options.message);
  },
});

/**
 * Rate limiter for ML service conversion
 */
export const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 conversions per minute
  message: 'Too many conversion requests, please wait a moment.',
  handler: (req, res, next, options) => {
    throw new ApiError(429, options.message);
  },
});

/**
 * Strict rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later.',
  handler: (req, res, next, options) => {
    throw new ApiError(429, options.message);
  },
});
