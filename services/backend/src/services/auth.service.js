import User from '../models/User.model.js';
import { generateTokens } from './token.service.js';
import logger from '../config/logger.js';

/**
 * Create new user from OAuth profile
 */
export const createUserFromOAuth = async (profile, provider) => {
  const user = await User.create({
    googleId: provider === 'google' ? profile.id : undefined,
    email: profile.emails[0].value,
    name: profile.displayName,
    avatar: profile.photos?.[0]?.value,
    provider,
  });

  logger.info(`New user created via ${provider}: ${user.email}`);
  return user;
};

/**
 * Find or create user from OAuth
 */
export const findOrCreateOAuthUser = async (profile, provider) => {
  let user;

  if (provider === 'google') {
    user = await User.findOne({ googleId: profile.id });
  }

  if (!user) {
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Update OAuth ID
      if (provider === 'google') {
        user.googleId = profile.id;
      }
      user.avatar = profile.photos?.[0]?.value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      logger.info(`Existing user linked to ${provider}: ${user.email}`);
    } else {
      // Create new user
      user = await createUserFromOAuth(profile, provider);
    }
  } else {
    // Update last login
    user.lastLogin = new Date();
    await user.save();
  }

  return user;
};

/**
 * Generate authentication tokens for user
 */
export const generateAuthTokens = (userId) => {
  return generateTokens(userId);
};

/**
 * Validate user credentials
 */
export const validateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return { valid: false, error: 'User not found' };
  }

  if (!user.isActive) {
    return { valid: false, error: 'User account is deactivated' };
  }

  return { valid: true, user };
};
