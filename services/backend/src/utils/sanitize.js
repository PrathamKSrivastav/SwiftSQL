/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Sanitize SQL query (basic protection)
 */
export const sanitizeSQL = (query) => {
  if (typeof query !== 'string') return query;

  // Remove dangerous SQL keywords from user input
  const dangerousPatterns = [
    /DROP\s+TABLE/gi,
    /DROP\s+DATABASE/gi,
    /TRUNCATE/gi,
    /DELETE\s+FROM.*WHERE\s+1=1/gi,
  ];

  let sanitized = query;
  dangerousPatterns.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      throw new Error('Potentially dangerous SQL detected');
    }
  });

  return sanitized.trim();
};

/**
 * Remove sensitive fields from object
 */
export const removeSensitiveFields = (obj, fields = ['password', 'token', 'secret']) => {
  const sanitized = { ...obj };
  
  fields.forEach((field) => {
    delete sanitized[field];
  });

  return sanitized;
};

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
export const sanitizeMongoQuery = (query) => {
  if (typeof query !== 'object' || query === null) {
    return query;
  }

  const sanitized = {};

  for (const key in query) {
    // Skip keys that start with $ or contain .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof query[key] === 'object' && query[key] !== null) {
      sanitized[key] = sanitizeMongoQuery(query[key]);
    } else {
      sanitized[key] = query[key];
    }
  }

  return sanitized;
};
