import User from '../models/User.model.js';
import { generateTokens } from '../services/token.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Google OAuth callback handler
 * Called after successful Google authentication
 */
export const googleCallback = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);

  // Set refresh token in httpOnly cookie (secure)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info(`User logged in: ${req.user.email}`);

  // Redirect to frontend with access token
  const redirectUrl = `${process.env.CORS_ORIGIN}/auth/callback?token=${accessToken}`;
  res.redirect(redirectUrl);
});

/**
 * Get current authenticated user
 */
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Logout user
 */
export const logout = catchAsync(async (req, res) => {
  // Clear refresh token cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  logger.info(`User logged out: ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * Refresh access token using refresh token
 */
export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Generate new access token
  const { accessToken: newAccessToken } = generateTokens(user._id);

  res.status(200).json({
    status: 'success',
    data: { accessToken: newAccessToken },
  });
});
