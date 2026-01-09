/**
 * @jest-environment node
 */
import { GET } from './route';

describe('Health Check API', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('healthy');
    expect(data.data.timestamp).toBeDefined();
  });

  it('should return a valid ISO timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    const timestamp = new Date(data.data.timestamp);
    expect(timestamp.toISOString()).toBe(data.data.timestamp);
  });
});
