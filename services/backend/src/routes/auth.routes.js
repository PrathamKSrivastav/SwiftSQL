import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../config/logger.js';

const router = express.Router();

// ==========================================
// Google OAuth Routes
// ==========================================

/**
 * @route   POST /api/v1/auth/google
 * @desc    Handle Google OAuth credential from frontend
 * @access  Public
 */
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: 'error',
        message: 'No credential provided',
      });
    }

    // Call controller to process Google credential
    await authController.googleCallback(req, res);
  } catch (error) {
    logger.error('❌ Google auth error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    await authController.getMe(req, res);
  } catch (error) {
    logger.error('❌ Get user error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
    });
  }
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('❌ Logout error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
    });
  }
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token required',
      });
    }

    // Call controller to refresh token
    await authController.refreshToken(req, res);
  } catch (error) {
    logger.error('❌ Token refresh error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed',
    });
  }
});

export default router;
