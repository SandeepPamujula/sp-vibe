import { logger } from '@/lib/logger';
import pino from 'pino';

// Mock pino to verify calls
jest.mock('pino', () => {
    const mockPinoInstance = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        child: jest.fn().mockReturnThis(),
    };
    const mockPino = jest.fn(() => mockPinoInstance);
    (mockPino as any).stdTimeFunctions = { isoTime: jest.fn() };
    return mockPino;
});

describe('Logger', () => {
    const mockPinoInstance = pino() as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should log info messages with data', () => {
        logger.info('test message', { foo: 'bar' });
        expect(mockPinoInstance.info).toHaveBeenCalledWith({ foo: 'bar' }, 'test message');
    });

    it('should log error messages with data', () => {
        logger.error('error message', { err: 'oops' });
        expect(mockPinoInstance.error).toHaveBeenCalledWith({ err: 'oops' }, 'error message');
    });

    it('should create a child logger with context', () => {
        const context = { requestId: 'req-123', tenantId: 'tenant-456' };
        const childLogger = logger.withContext(context);

        expect(mockPinoInstance.child).toHaveBeenCalledWith(context);

        childLogger.info('child message');
        // Since we mocked child to return 'this', the same mock instance is used
        expect(mockPinoInstance.info).toHaveBeenCalledWith({}, 'child message');
    });
});
