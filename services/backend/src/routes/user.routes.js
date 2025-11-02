import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile with statistics
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PATCH /api/v1/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
  ],
  validate,
  userController.updateProfile
);

/**
 * @route   GET /api/v1/user/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', userController.getPreferences);

/**
 * @route   PATCH /api/v1/user/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.patch(
  '/preferences',
  [
    body('defaultDatabase')
      .optional()
      .isMongoId()
      .withMessage('Invalid database ID'),
    
    body('theme')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme must be either "light" or "dark"'),
  ],
  validate,
  userController.updatePreferences
);

/**
 * @route   GET /api/v1/user/statistics
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/statistics', userController.getStatistics);

/**
 * @route   GET /api/v1/user/activity
 * @desc    Get recent user activity
 * @access  Private
 */
router.get('/activity', userController.getActivity);

/**
 * @route   GET /api/v1/user/export
 * @desc    Export user data (GDPR)
 * @access  Private
 */
router.get('/export', userController.exportData);

/**
 * @route   POST /api/v1/user/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
router.post('/deactivate', userController.deactivateAccount);

/**
 * @route   POST /api/v1/user/reactivate
 * @desc    Reactivate user account
 * @access  Private
 */
router.post('/reactivate', userController.reactivateAccount);

/**
 * @route   DELETE /api/v1/user/account
 * @desc    Delete user account permanently
 * @access  Private
 */
router.delete(
  '/account',
  [
    body('confirmEmail')
      .trim()
      .isEmail()
      .withMessage('Valid email is required for confirmation'),
  ],
  validate,
  userController.deleteAccount
);

export default router;
