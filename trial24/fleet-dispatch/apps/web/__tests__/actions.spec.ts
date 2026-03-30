// TRACED:WEB-ACTIONS-SPEC

// Mock next/headers before imports
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: jest.fn(() => ({ value: 'test-token' })),
    set: jest.fn(),
  })),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('apiFetch', () => {
    it('sets Authorization header when token provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      const { apiFetch } = await import('../lib/api');
      const result = await apiFetch('/test', { token: 'my-token' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('throws on non-ok response (error path)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      const { apiFetch } = await import('../lib/api');
      await expect(apiFetch('/test')).rejects.toThrow('Unauthorized');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('sets Content-Type to application/json', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { apiFetch } = await import('../lib/api');
      const result = await apiFetch('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getApiBaseUrl', () => {
    it('returns the configured base URL', async () => {
      const { getApiBaseUrl } = await import('../lib/api');
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });
});
