type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    requestId?: string;
    tenantId?: string;
    [key: string]: any;
}

class Logger {
    private context: LogContext = {};

    setContext(context: LogContext) {
        this.context = { ...this.context, ...context };
    }

    private log(level: LogLevel, message: string, data?: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...this.context,
            ...(data && typeof data === 'object' ? data : { data }),
        };

        console[level](JSON.stringify(logEntry));
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, data?: any) {
        this.log('error', message, data);
    }

    debug(message: string, data?: any) {
        this.log('debug', message, data);
    }
}

export const logger = new Logger();
