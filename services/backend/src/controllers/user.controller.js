import User from '../models/User.model.js';
import QueryHistory from '../models/QueryHistory.model.js';
import DatabaseConnection from '../models/DatabaseConnection.model.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

/**
 * Get user profile
 * Already handled in auth.controller.js as getMe()
 * This is an extended version with more details
 */
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get user statistics
  const totalQueries = await QueryHistory.countDocuments({ userId: user._id });
  const successfulQueries = await QueryHistory.countDocuments({
    userId: user._id,
    'executionResult.success': true,
  });
  const totalConnections = await DatabaseConnection.countDocuments({ userId: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      statistics: {
        totalQueries,
        successfulQueries,
        failedQueries: totalQueries - successfulQueries,
        totalConnections,
      },
    },
  });
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id;

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, 'Name is required');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.name = name.trim();
  await user.save();

  logger.info(`User profile updated: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Update user preferences
 */
export const updatePreferences = catchAsync(async (req, res) => {
  const { defaultDatabase, theme } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Initialize preferences if not exists
  if (!user.preferences) {
    user.preferences = {};
  }

  // Update preferences
  if (defaultDatabase !== undefined) {
    // Verify the database connection exists
    const connection = await DatabaseConnection.findOne({
      _id: defaultDatabase,
      userId,
    });

    if (!connection) {
      throw new ApiError(404, 'Database connection not found');
    }

    user.preferences.defaultDatabase = defaultDatabase;
  }

  if (theme) {
    if (!['light', 'dark'].includes(theme)) {
      throw new ApiError(400, 'Invalid theme. Must be "light" or "dark"');
    }
    user.preferences.theme = theme;
  }

  await user.save();

  logger.info(`User preferences updated: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.preferences,
    },
  });
});

/**
 * Get user preferences
 */
export const getPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.preferences || {
        defaultDatabase: null,
        theme: 'light',
      },
    },
  });
});

/**
 * Get user statistics
 */
export const getStatistics = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Total queries
  const totalQueries = await QueryHistory.countDocuments({ userId });

  // Successful vs failed queries
  const successfulQueries = await QueryHistory.countDocuments({
    userId,
    'executionResult.success': true,
  });
  const failedQueries = totalQueries - successfulQueries;

  // Total database connections
  const totalConnections = await DatabaseConnection.countDocuments({ userId });

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentQueries = await QueryHistory.countDocuments({
    userId,
    createdAt: { $gte: sevenDaysAgo },
  });

  // Most used databases
  const databaseUsage = await QueryHistory.aggregate([
    { $match: { userId } },
    { $group: { _id: '$database', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Average execution time
  const avgExecutionTime = await QueryHistory.aggregate([
    { $match: { userId, executionTime: { $exists: true } } },
    { $group: { _id: null, avgTime: { $avg: '$executionTime' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalQueries,
        successfulQueries,
        failedQueries,
        successRate: totalQueries > 0 ? ((successfulQueries / totalQueries) * 100).toFixed(2) : 0,
        totalConnections,
        recentQueries,
      },
      databaseUsage: databaseUsage.map((db) => ({
        database: db._id,
        count: db.count,
      })),
      performance: {
        averageExecutionTime: avgExecutionTime.length > 0 ? Math.round(avgExecutionTime[0].avgTime) : 0,
      },
    },
  });
});

/**
 * Get user activity (recent queries)
 */
export const getActivity = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { limit = 10 } = req.query;

  const recentActivity = await QueryHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('naturalLanguageQuery generatedSQL database executionResult createdAt')
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      activity: recentActivity.map((item) => ({
        id: item._id,
        query: item.naturalLanguageQuery,
        sql: item.generatedSQL,
        database: item.database,
        success: item.executionResult?.success || false,
        timestamp: item.createdAt,
      })),
    },
  });
});

/**
 * Delete user account
 */
export const deleteAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { confirmEmail } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Confirm email before deletion
  if (confirmEmail !== user.email) {
    throw new ApiError(400, 'Email confirmation does not match');
  }

  // Delete all user data
  await Promise.all([
    QueryHistory.deleteMany({ userId }),
    DatabaseConnection.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  logger.warn(`User account deleted: ${user.email}`);

  // Clear cookies
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully',
  });
});

/**
 * Deactivate user account (soft delete)
 */
export const deactivateAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = false;
  await user.save();

  logger.info(`User account deactivated: ${user.email}`);

  // Clear cookies
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully',
  });
});

/**
 * Reactivate user account
 */
export const reactivateAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = true;
  await user.save();

  logger.info(`User account reactivated: ${user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Account reactivated successfully',
    data: { user },
  });
});

/**
 * Export user data (GDPR compliance)
 */
export const exportData = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const [user, queryHistory, connections] = await Promise.all([
    User.findById(userId).select('-__v'),
    QueryHistory.find({ userId }).select('-__v'),
    DatabaseConnection.find({ userId }).select('-password -__v'),
  ]);

  const exportData = {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
    queryHistory: queryHistory.map((q) => ({
      naturalLanguage: q.naturalLanguageQuery,
      sql: q.generatedSQL,
      database: q.database,
      success: q.executionResult?.success,
      timestamp: q.createdAt,
    })),
    connections: connections.map((c) => ({
      name: c.name,
      host: c.host,
      database: c.database,
      createdAt: c.createdAt,
    })),
    exportDate: new Date().toISOString(),
  };

  logger.info(`User data exported: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: exportData,
  });
});
