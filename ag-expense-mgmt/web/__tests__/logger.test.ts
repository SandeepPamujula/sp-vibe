import { logger } from '@/lib/logger';

describe('Logger', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should log structured JSON', () => {
        logger.info('test message', { foo: 'bar' });

        expect(consoleSpy).toHaveBeenCalled();
        const output = JSON.parse(consoleSpy.mock.calls[0][0]);
        expect(output).toMatchObject({
            level: 'info',
            message: 'test message',
            foo: 'bar'
        });
        expect(output).toHaveProperty('timestamp');
    });

    it('should include context in logs', () => {
        logger.setContext({ requestId: '123', tenantId: 'abc' });
        logger.info('context message');

        const output = JSON.parse(consoleSpy.mock.calls[0][0]);
        expect(output).toMatchObject({
            requestId: '123',
            tenantId: 'abc',
            message: 'context message'
        });
    });
});
