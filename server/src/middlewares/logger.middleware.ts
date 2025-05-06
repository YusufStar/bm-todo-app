import { Request, Response, NextFunction } from 'express';
import { logger } from '../common/utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Get the start time
  const start = Date.now();

  // Process the request
  next();
  
  // When the response is finished
  res.on('finish', () => {
    // Calculate duration
    const duration = Date.now() - start;
    
    // Get the status code
    const statusCode = res.statusCode;
    
    // Choose log level based on status code
    const logMethod = statusCode >= 500 
      ? 'error' 
      : statusCode >= 400 
        ? 'warn' 
        : 'http';
    
    // Log the response with clean format
    logger[logMethod](`${req.method} ${req.originalUrl} [${statusCode}] ${duration}ms`, {
      ip: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      ...(Object.keys(req.body || {}).length ? { body: req.body } : {}),
      ...(Object.keys(req.query || {}).length ? { query: req.query } : {}),
      ...(Object.keys(req.params || {}).length ? { params: req.params } : {})
    });
  });
}; 