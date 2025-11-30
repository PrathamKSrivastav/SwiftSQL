import DatabaseConnection from '../models/DatabaseConnection.model.js';
import mysqlService from '../services/mysql.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

/**
 * Save database connection for user
 */
export const saveConnection = catchAsync(async (req, res) => {
  const { name, host, port, username, password, database, isDefault } = req.body;
  const userId = req.user._id;

  // Validation
  if (!name || !host || !username || !password || !database) {
    throw new ApiError(400, 'All connection fields are required');
  }

  // Test connection before saving
  try {
    await mysqlService.testConnection(host, port || 3306, username, password, database);
  } catch (error) {
    throw new ApiError(400, `Connection test failed: ${error.message}`);
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await DatabaseConnection.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  // Create connection
  const connection = await DatabaseConnection.create({
    userId,
    name,
    host,
    port: port || 3306,
    username,
    password,
    database,
    isDefault: isDefault || false,
  });

  logger.info(`Database connection saved: ${name} by user: ${req.user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      connection: {
        id: connection._id,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        isDefault: connection.isDefault,
      },
    },
  });
});

/**
 * Get all saved connections for user
 */
export const getConnections = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const connections = await DatabaseConnection.find({ userId })
    .select('-password -__v')
    .sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { connections },
  });
});

/**
 * Get single connection by ID
 */
export const getConnection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const connection = await DatabaseConnection.findOne({ _id: id, userId });

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  // Return with decrypted password
  res.status(200).json({
    status: 'success',
    data: {
      connection: {
        id: connection._id,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.decryptPassword(),
        database: connection.database,
        isDefault: connection.isDefault,
      },
    },
  });
});

/**
 * Update connection
 */
export const updateConnection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  const connection = await DatabaseConnection.findOne({ _id: id, userId });

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    await DatabaseConnection.updateMany(
      { userId, _id: { $ne: id }, isDefault: true },
      { isDefault: false }
    );
  }

  // Update connection
  Object.assign(connection, updates);
  await connection.save();

  logger.info(`Database connection updated: ${id} by user: ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    data: { connection },
  });
});

/**
 * Delete connection
 */
export const deleteConnection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const connection = await DatabaseConnection.findOne({ _id: id, userId });

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  await connection.deleteOne();

  logger.info(`Database connection deleted: ${id} by user: ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Connection deleted successfully',
  });
});

/**
 * List tables in a database
 */
export const listTables = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const connection = await DatabaseConnection.findOne({ _id: id, userId });

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  const decryptedPassword = connection.decryptPassword();

  try {
    const tables = await mysqlService.listTables(
      connection.host,
      connection.port,
      connection.username,
      decryptedPassword,
      connection.database
    );

    res.status(200).json({
      status: 'success',
      data: { tables },
    });
  } catch (error) {
    logger.error(`Failed to list tables: ${error.message}`);
    throw new ApiError(400, `Failed to list tables: ${error.message}`);
  }
});

/**
 * Test database connection without saving
 */
export const testConnection = catchAsync(async (req, res) => {
  const { host, port, username, password, database } = req.body;

  try {
    await mysqlService.testConnection(
      host,
      port || 3306,
      username,
      password,
      database
    );
    
    logger.info(`Connection test successful for ${database} at ${host} by user: ${req.user.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Connection successful!',
    });
  } catch (error) {
    logger.error(`Connection test failed: ${error.message}`);
    throw new ApiError(400, `Connection failed: ${error.message}`);
  }
});


/**
 * Get table schema
 */
export const getTableSchema = catchAsync(async (req, res) => {
  const { id, tableName } = req.params;
  const userId = req.user._id;

  const connection = await DatabaseConnection.findOne({ _id: id, userId });

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  const decryptedPassword = connection.decryptPassword();

  try {
    const schema = await mysqlService.getTableSchema(
      connection.host,
      connection.port,
      connection.username,
      decryptedPassword,
      connection.database,
      tableName
    );

    res.status(200).json({
      status: 'success',
      data: { schema },
    });
  } catch (error) {
    logger.error(`Failed to get table schema: ${error.message}`);
    throw new ApiError(400, `Failed to get table schema: ${error.message}`);
  }
});
