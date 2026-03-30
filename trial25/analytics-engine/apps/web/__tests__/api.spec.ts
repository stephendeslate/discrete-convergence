// TRACED:TEST-WEB-API — Tests for API client
import { apiFetch, apiClient, authApi, dashboardApi, widgetApi, dataSourceApi } from '../lib/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('API Client', () => {
  // VERIFY:AE-WEB-API-T001
  it('adds Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await apiFetch('/test', { token: 'my-token' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    );
  });

  // VERIFY:AE-WEB-API-T002
  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(apiFetch('/protected')).rejects.toThrow('Unauthorized');
  });

  // VERIFY:AE-WEB-API-T003
  it('authApi.login sends email and password', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'tok', refreshToken: 'ref' }),
    });

    await authApi.login('user@test.com', 'pass123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@test.com', password: 'pass123' }),
      }),
    );
  });

  // VERIFY:AE-WEB-API-T004
  it('dashboardApi.list sends GET with token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
    });

    await dashboardApi.list('my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/dashboards'),
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  // VERIFY:AE-WEB-API-T005
  it('handles malformed JSON error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('bad json'); },
    });

    await expect(apiFetch('/bad')).rejects.toThrow('Request failed');
  });

  // VERIFY:AE-WEB-API-T006
  it('widgetApi.create sends POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    });

    await widgetApi.create({ title: 'Test', type: 'BAR_CHART', dashboardId: '1' }, 'tok');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/widgets'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('apiClient should make GET requests by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });
    const result = await apiClient('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toBeDefined();
  });

  it('apiClient should include authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    await apiClient('/test', { token: 'my-token' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    );
  });

  it('apiClient should throw on non-ok response (error path)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });
    await expect(apiClient('/test')).rejects.toThrow('Unauthorized');
  });

  it('apiClient should handle JSON parse failure gracefully (error path)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Invalid JSON'); },
    });
    await expect(apiClient('/test')).rejects.toThrow('Request failed');
  });

  it('dataSourceApi.sync sends POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'syncing' }),
    });

    await dataSourceApi.sync('ds-1', 'tok');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/data-sources/ds-1/sync'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
