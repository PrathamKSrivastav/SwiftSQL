import axios from 'axios';
import logger from '../config/logger.js';

class MLServiceClient {
  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`ML Service Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`ML Service Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`ML Service Response: ${response.status} - ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(
            `ML Service Error: ${error.response.status} - ${
              error.response.data?.detail || error.message
            }`
          );
        } else if (error.request) {
          logger.error(`ML Service No Response: ${error.message}`);
        } else {
          logger.error(`ML Service Request Setup Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Convert natural language to SQL
   */
  async convertNLToSQL(naturalLanguageQuery) {
    try {
      const response = await this.client.post('/api/v1/convert', {
        query: naturalLanguageQuery,
      });

      return {
        sql: response.data.sql,
        originalQuery: response.data.original_query,
      };
    } catch (error) {
      if (error.response?.status === 503) {
        throw new Error('ML service is unavailable. Please try again later.');
      }
      throw new Error(`Failed to convert query: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        data: response.data,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Get model info
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/api/v1/convert/info');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get model info: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new MLServiceClient();
