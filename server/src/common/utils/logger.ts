import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../../config/app.config';

// Define custom colors
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(customColors);

// Custom format for metadata
const formatMeta = (meta: any) => {
  if (!Object.keys(meta).length) return '';
  
  const colorize = winston.format.colorize();
  const lines = Object.entries(meta).map(([key, value]) => {
    const coloredKey = colorize.colorize('info', key);
    const valueStr = typeof value === 'object' 
      ? JSON.stringify(value, null, 2)
      : String(value);
    return `  ┣━ ${coloredKey} → ${valueStr}`;
  });
  
  return `\n${lines.join('\n')}`;
};

// Custom format for console output with colors and timestamps
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = formatMeta(meta);
    return `[${timestamp}] ${level.padEnd(7)}: ${message}${metaStr}`;
  })
);

// Format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
    
    // Rotate file for errors
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    
    // Rotate file for all logs
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Utility function to create extra context
const withContext = (context: string) => {
  return {
    error: (message: string, meta: object = {}) => logger.error(`[${context}] ${message}`, meta),
    warn: (message: string, meta: object = {}) => logger.warn(`[${context}] ${message}`, meta),
    info: (message: string, meta: object = {}) => logger.info(`[${context}] ${message}`, meta),
    http: (message: string, meta: object = {}) => logger.http(`[${context}] ${message}`, meta),
    debug: (message: string, meta: object = {}) => logger.debug(`[${context}] ${message}`, meta),
  };
};

export { logger, withContext }; 