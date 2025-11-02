import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';
import logger from './logger.js';

let isConfigured = false;

/**
 * Initialize Passport OAuth Strategy
 * Called from app.js after environment variables are loaded
 */
export const initializePassport = () => {
  // Prevent multiple initializations
  if (isConfigured) return;

  const clientID = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  // Validate credentials exist
  if (!clientID || !clientSecret) {
    logger.warn('⚠️  Google OAuth credentials not configured');
    return;
  }

  try {
    // Register Google OAuth Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Find or create user
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
              user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0]?.value,
                provider: 'google',
              });
              logger.info(`✅ New user created: ${user.email}`);
            } else {
              user.lastLogin = new Date();
              await user.save();
            }

            return done(null, user);
          } catch (error) {
            logger.error(`❌ OAuth strategy error: ${error.message}`);
            return done(error, null);
          }
        }
      )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    isConfigured = true;
    logger.info('✅ Passport initialized with Google OAuth');
  } catch (error) {
    logger.error(`❌ Passport initialization error: ${error.message}`);
  }
};

export default passport;
