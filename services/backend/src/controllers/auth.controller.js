import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import logger from '../config/logger.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// Generate JWT Token
// ==========================================
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ==========================================
// Google OAuth Callback Handler
// ==========================================
export const googleCallback = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: 'error',
        message: 'No credential provided',
      });
    }

    logger.info('🔐 Verifying Google credential...');

    // Verify the JWT credential from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    logger.info(`✅ Google credential verified for: ${email}`);

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      logger.info(`📝 Creating new user: ${email}`);
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        provider: 'google',
      });
    } else {
      logger.info(`✅ User exists: ${email}`);
      // Update picture if changed
      if (picture && user.picture !== picture) {
        user.picture = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const token = signToken(user._id);

    logger.info(`✅ JWT token generated for user: ${user._id}`);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    logger.error('❌ Google OAuth error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};

// ==========================================
// Get Current User
// ==========================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    logger.error('❌ Get user error:', error.message);
    throw error;
  }
};

// ==========================================
// Refresh Token
// ==========================================
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newToken = signToken(decoded.id);

    res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    logger.error('❌ Token refresh error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Token refresh failed',
    });
  }
};
