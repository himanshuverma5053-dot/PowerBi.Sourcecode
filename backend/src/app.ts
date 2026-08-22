import express, { Express } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { requestLogger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

/**
 * Creates and configures the Express backend application
 */
export function createApp(): Express {
  const app = express();

  // Cross-Origin Resource Sharing
  app.use(cors({
    origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-email', 'x-admin-console']
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use(requestLogger);

  // Mount API routes under /api
  app.use('/api', apiRouter);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}
