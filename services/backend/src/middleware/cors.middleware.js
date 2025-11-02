import cors from 'cors';

/**
 * CORS options
 */
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsOptions);
