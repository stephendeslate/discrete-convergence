// TRACED:WEB-API-SPEC

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockFetch.mockReset();
  });

  describe('apiFetch', () => {
    it('appends path to base URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      const { apiFetch } = await import('../lib/api');
      const result = await apiFetch('/vehicles');

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/vehicles');
      expect(result).toBeDefined();
    });

    it('handles JSON parse errors gracefully (error path)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('invalid json')),
      });

      const { apiFetch } = await import('../lib/api');
      await expect(apiFetch('/test')).rejects.toThrow('Request failed');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('passes custom headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { apiFetch } = await import('../lib/api');
      await apiFetch('/test', {
        headers: { 'X-Custom': 'value' } as Record<string, string>,
      });

      const calledHeaders = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
      expect(calledHeaders['X-Custom']).toBe('value');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('sends body as-is for POST requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { apiFetch } = await import('../lib/api');
      const body = JSON.stringify({ vin: 'ABC' });
      await apiFetch('/vehicles', { method: 'POST', body });

      const calledBody = (mockFetch.mock.calls[0][1] as RequestInit).body;
      expect(calledBody).toBe(body);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/vehicles'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('does not set Authorization header when no token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { apiFetch } = await import('../lib/api');
      await apiFetch('/test');

      const calledHeaders = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
      expect(calledHeaders['Authorization']).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
