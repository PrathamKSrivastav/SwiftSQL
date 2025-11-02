/**
 * ⚠️  CRITICAL: Load environment variables FIRST
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');
console.log('🔍 Loading .env from:', envPath);
console.log('   .env exists:', fs.existsSync(envPath) ? 'YES ✅' : 'NO ❌');

const result = dotenv.config({ path: envPath });
console.log('   dotenv.config:', result.error ? `ERROR: ${result.error.message}` : 'SUCCESS ✅');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅' : '❌');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅' : '❌\n');

// NOW import everything (env vars are ready)
import app from './src/app.js';
import connectDB from './src/config/database.js';
import mysqlService from './src/services/mysql.service.js';
import mlServiceClient from './src/services/mlService.client.js';
import logger from './src/config/logger.js';
import { initializePassport } from './src/config/passport.js';

// ==========================================
// Validate Required Environment Variables
// ==========================================
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

// ==========================================
// Initialize Passport (After env vars loaded)
// ==========================================
logger.info('🔐 Initializing Passport...');
initializePassport();
logger.info('✅ Passport configured\n');

// ==========================================
// Configuration
// ==========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// Startup Sequence
// ==========================================
const startServer = async () => {
  try {
    logger.info('🚀 Starting SwiftSQL Backend...');
    logger.info(`📝 Environment: ${NODE_ENV}`);
    
    logger.info('🔌 Connecting to MongoDB...');
    await connectDB();

    logger.info('🤖 Checking ML service...');
    const mlHealth = await mlServiceClient.healthCheck();
    if (mlHealth.status === 'healthy') {
      logger.info('✅ ML service is healthy');
    }

    const server = app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 SwiftSQL Backend API Server                         ║
║   Port: ${PORT}                                              ║
║   API: http://localhost:${PORT}/api/v1                       ║
║   Status: ✅ Server is running                            ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received: shutting down...`);
      server.close(async () => {
        await mysqlService.closeAll();
        logger.info('✅ Shutdown complete');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Force shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error(`❌ Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
