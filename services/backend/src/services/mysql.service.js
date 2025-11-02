import mysql from 'mysql2/promise';
import logger from '../config/logger.js';

class MySQLService {
  constructor() {
    this.connections = new Map(); // Store connection pools per config
  }

  /**
   * Get connection pool key
   */
  getPoolKey(host, port, username, database) {
    return `${host}:${port}:${username}:${database}`;
  }

  /**
   * Create connection pool
   */
  createPool(host, port, username, password, database) {
    const poolKey = this.getPoolKey(host, port, username, database);

    // Return existing pool if available
    if (this.connections.has(poolKey)) {
      return this.connections.get(poolKey);
    }

    // Create new pool
    const pool = mysql.createPool({
      host,
      port: port || 3306,
      user: username,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    this.connections.set(poolKey, pool);
    logger.info(`MySQL connection pool created for: ${host}:${port}/${database}`);

    return pool;
  }

  /**
   * Execute SQL query
   */
  async executeQuery(host, port, username, password, database, query) {
    const pool = this.createPool(host, port, username, password, database);

    let connection;
    try {
      connection = await pool.getConnection();

      const startTime = Date.now();
      const [results] = await connection.query(query);
      const executionTime = Date.now() - startTime;

      logger.info(`Query executed in ${executionTime}ms`);

      return {
        success: true,
        results: Array.isArray(results) ? results : [results],
        rowCount: Array.isArray(results) ? results.length : results.affectedRows || 0,
        executionTime,
      };
    } catch (error) {
      logger.error(`MySQL query error: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Test connection
   */
  async testConnection(host, port, username, password, database) {
    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port: port || 3306,
        user: username,
        password,
        database,
        connectTimeout: 10000, // 10 seconds
      });

      await connection.ping();

      logger.info(`Connection test successful: ${host}:${port}/${database}`);

      return {
        success: true,
        message: 'Connection successful',
        host,
        port: port || 3306,
        database,
      };
    } catch (error) {
      logger.error(`Connection test failed: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * List all databases
   */
  async listDatabases(host, port, username, password) {
    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port: port || 3306,
        user: username,
        password,
      });

      const [rows] = await connection.query('SHOW DATABASES');
      return rows.map((row) => row.Database);
    } catch (error) {
      logger.error(`Failed to list databases: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * List all tables in database
   */
  async listTables(host, port, username, password, database) {
    const pool = this.createPool(host, port, username, password, database);

    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.query('SHOW TABLES');

      const tableKey = `Tables_in_${database}`;
      return rows.map((row) => row[tableKey]);
    } catch (error) {
      logger.error(`Failed to list tables: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Get table schema
   */
  async getTableSchema(host, port, username, password, database, tableName) {
    const pool = this.createPool(host, port, username, password, database);

    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.query(`DESCRIBE \`${tableName}\``);

      return rows.map((row) => ({
        field: row.Field,
        type: row.Type,
        null: row.Null === 'YES',
        key: row.Key,
        default: row.Default,
        extra: row.Extra,
      }));
    } catch (error) {
      logger.error(`Failed to get table schema: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Get table data preview (first 100 rows)
   */
  async getTablePreview(host, port, username, password, database, tableName, limit = 100) {
    const pool = this.createPool(host, port, username, password, database);

    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT ?`, [limit]);

      return rows;
    } catch (error) {
      logger.error(`Failed to get table preview: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Close all connection pools
   */
  async closeAll() {
    const closePromises = [];

    for (const [key, pool] of this.connections.entries()) {
      logger.info(`Closing connection pool: ${key}`);
      closePromises.push(pool.end());
    }

    await Promise.all(closePromises);
    this.connections.clear();
    logger.info('All MySQL connection pools closed');
  }

  /**
   * Close specific connection pool
   */
  async closePool(host, port, username, database) {
    const poolKey = this.getPoolKey(host, port, username, database);

    if (this.connections.has(poolKey)) {
      const pool = this.connections.get(poolKey);
      await pool.end();
      this.connections.delete(poolKey);
      logger.info(`MySQL connection pool closed: ${poolKey}`);
    }
  }
}

// Export singleton instance
export default new MySQLService();
