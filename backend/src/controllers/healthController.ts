import { Request, Response } from 'express';
import { amplifyBackendConfig } from '../config/awsAmplify.js';

export function getHealthStatus(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    app: 'MAGADH TYRES Backend API Microservice',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    awsAmplifyReady: amplifyBackendConfig.isConfigured
  });
}
