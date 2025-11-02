import QueryHistory from '../models/QueryHistory.model.js';
import mlServiceClient from '../services/mlService.client.js';
import mysqlService from '../services/mysql.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

/**
 * Convert natural language to SQL using ML service
 */
export const convertToSQL = catchAsync(async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length === 0) {
    throw new ApiError(400, 'Natural language query is required');
  }

  logger.info(`Converting query: "${query}" for user: ${req.user.email}`);

  try {
    // Call ML service to convert NL to SQL
    const result = await mlServiceClient.convertNLToSQL(query);

    res.status(200).json({
      status: 'success',
      data: {
        naturalLanguage: query,
        generatedSQL: result.sql,
      },
    });
  } catch (error) {
    logger.error(`ML service error: ${error.message}`);
    throw new ApiError(503, 'Failed to convert query. ML service unavailable.');
  }
});

/**
 * Execute SQL query on user's MySQL database
 */
export const executeSQL = catchAsync(async (req, res) => {
  const { query: sqlQuery, database, naturalLanguage } = req.body;
  const userId = req.user._id;

  // Validation
  if (!sqlQuery || sqlQuery.trim().length === 0) {
    throw new ApiError(400, 'SQL query is required');
  }

  if (!database) {
    throw new ApiError(400, 'Database connection details are required');
  }

  logger.info(`Executing SQL for user ${req.user.email}: ${sqlQuery.substring(0, 50)}...`);

  try {
    const startTime = Date.now();

    // Execute query on MySQL
    const result = await mysqlService.executeQuery(
      database.host,
      database.port,
      database.username,
      database.password,
      database.database,
      sqlQuery
    );

    const executionTime = Date.now() - startTime;

    // Save to query history
    await QueryHistory.create({
      userId,
      naturalLanguageQuery: naturalLanguage || '',
      generatedSQL: sqlQuery,
      database: database.database,
      executionResult: {
        success: true,
        rowCount: result.rowCount,
        data: result.results,
      },
      executionTime,
    });

    logger.info(`Query executed successfully in ${executionTime}ms`);

    res.status(200).json({
      status: 'success',
      data: {
        results: result.results,
        rowCount: result.rowCount,
        executionTime,
      },
    });
  } catch (error) {
    logger.error(`Query execution failed: ${error.message}`);

    // Save failed query to history
    await QueryHistory.create({
      userId,
      naturalLanguageQuery: naturalLanguage || '',
      generatedSQL: sqlQuery,
      database: database.database || 'unknown',
      executionResult: {
        success: false,
        error: error.message,
      },
    });

    throw new ApiError(400, `Query execution failed: ${error.message}`);
  }
});

/**
 * Get query history for authenticated user
 */
export const getQueryHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, database } = req.query;
  const userId = req.user._id;

  // Build query filter
  const filter = { userId };
  if (database) {
    filter.database = database;
  }

  // Fetch history with pagination
  const history = await QueryHistory.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  const total = await QueryHistory.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      history,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Delete query from history
 */
export const deleteQueryHistory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const query = await QueryHistory.findOne({ _id: id, userId });

  if (!query) {
    throw new ApiError(404, 'Query not found or unauthorized');
  }

  await query.deleteOne();

  logger.info(`Query history deleted: ${id} by user: ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Query deleted successfully',
  });
});

/**
 * Test MySQL connection
 */
export const testConnection = catchAsync(async (req, res) => {
  const { host, port, username, password, database } = req.body;

  if (!host || !username || !password || !database) {
    throw new ApiError(400, 'All connection details are required');
  }

  logger.info(`Testing MySQL connection for user: ${req.user.email}`);

  try {
    const result = await mysqlService.testConnection(
      host,
      port || 3306,
      username,
      password,
      database
    );

    res.status(200).json({
      status: 'success',
      message: 'Connection successful',
      data: result,
    });
  } catch (error) {
    logger.error(`Connection test failed: ${error.message}`);
    throw new ApiError(400, `Connection failed: ${error.message}`);
  }
});
