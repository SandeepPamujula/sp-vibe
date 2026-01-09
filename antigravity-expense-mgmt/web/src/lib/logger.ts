import pino, { Logger as PinoLogger } from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const baseLogger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    browser: {
        asObject: true,
    },
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});

export interface LogContext {
    requestId?: string;
    tenantId?: string;
    [key: string]: any;
}

/**
 * Structured Logger using Pino
 * Supports JSON format in production and pretty print in development
 * Automatically includes RequestId and TenantId if provided in context
 */
class AppLogger {
    private logger: PinoLogger;

    constructor(logger: PinoLogger) {
        this.logger = logger;
    }

    info(message: string, data?: any) {
        this.logger.info(data || {}, message);
    }

    warn(message: string, data?: any) {
        this.logger.warn(data || {}, message);
    }

    error(message: string, data?: any) {
        this.logger.error(data || {}, message);
    }

    debug(message: string, data?: any) {
        this.logger.debug(data || {}, message);
    }

    /**
     * Creates a child logger with additional context (e.g., requestId, tenantId)
     */
    withContext(context: LogContext): AppLogger {
        return new AppLogger(this.logger.child(context));
    }
}

export const logger = new AppLogger(baseLogger);
export default logger;
