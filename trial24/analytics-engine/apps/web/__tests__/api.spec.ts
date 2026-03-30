// TRACED:TEST-WEB-API — Tests for API client
import { apiClient } from '../lib/api';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should make GET requests by default', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const result = await apiClient('/test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toBeDefined();
  });

  it('should include authorization header when token provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await apiClient('/test', { token: 'my-token' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    );
    expect(result).toBeDefined();
  });

  it('should throw on non-ok response (error path)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });

    await expect(apiClient('/test')).rejects.toThrow('Unauthorized');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle JSON parse failure gracefully (error path)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    await expect(apiClient('/test')).rejects.toThrow('Request failed');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
