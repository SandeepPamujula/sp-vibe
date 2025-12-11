/**
 * Logging Wrapper (Winston) - Singleton Pattern
 * 
 * Provides structured logging with Winston configured for different environments.
 * Logs are formatted consistently and include contextual information.
 * 
 * Uses singleton pattern to ensure only one logger instance exists.
 * 
 * @example
 * ```typescript
 * import { Logger } from '@/lib/logger';
 * 
 * const logger = Logger.getInstance();
 * logger.info('Invoice created', { invoiceId: '123', userId: 'user-1' });
 * logger.error('Failed to process invoice', { error, invoiceId: '123' });
 * ```
 */

import winston from 'winston';
import type { Logger as WinstonLogger } from 'winston';
import { config } from './config';

/**
 * Custom log format for structured logging
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format for development (more readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

/**
 * Logger Singleton Class
 * 
 * Ensures only one logger instance exists throughout the application.
 */
class Logger {
  private static instance: Logger;
  private winstonLogger: WinstonLogger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.winstonLogger = winston.createLogger({
      level: config.app.logLevel,
      format: logFormat,
      defaultMeta: {
        service: config.app.name,
        environment: config.app.env,
      },
      transports: [
        // Console transport (always enabled)
        new winston.transports.Console({
          format: config.app.isDevelopment ? consoleFormat : logFormat,
        }),
      ],
    });

    // Add file transports for production
    if (config.app.isProduction) {
      // Error log file
      this.winstonLogger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: logFormat,
        })
      );

      // Combined log file
      this.winstonLogger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: logFormat,
        })
      );
    }
  }

  /**
   * Get the singleton instance of Logger
   * 
   * @returns The singleton Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log an error message
   */
  public error(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.error(message, meta);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.warn(message, meta);
  }

  /**
   * Log an informational message
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.info(message, meta);
  }

  /**
   * Log a debug message
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.debug(message, meta);
  }

  /**
   * Get the underlying Winston logger instance
   * (for advanced usage if needed)
   */
  public getWinstonLogger(): WinstonLogger {
    return this.winstonLogger;
  }
}

/**
 * Export singleton instance for convenience
 * 
 * Usage:
 * - logger.error(message, meta) - Log errors
 * - logger.warn(message, meta) - Log warnings
 * - logger.info(message, meta) - Log informational messages
 * - logger.debug(message, meta) - Log debug messages (only in development)
 */
export const logger = Logger.getInstance();

/**
 * Export Logger class for advanced usage
 */
export { Logger };

