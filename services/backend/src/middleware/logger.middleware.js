import logger from '../config/logger.js';

/**
 * Log HTTP requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (req.user) {
      logData.userId = req.user._id;
      logData.userEmail = req.user.email;
    }

    if (res.statusCode >= 400) {
      logger.error(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};
