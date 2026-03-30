// TRACED:TEST-WEB-API — API client test suite
// VERIFY:FD-API-001 — API client makes GET by default
// VERIFY:FD-API-002 — API client includes auth token
// VERIFY:FD-API-003 — API client throws on non-ok response

import { apiFetch } from '../lib/api';

describe('API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should make GET request by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const result = await apiFetch('/vehicles');
    expect(result).toEqual({ data: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/vehicles'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should include auth token when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test', { token: 'test-token' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('should throw on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });

    await expect(apiFetch('/test')).rejects.toThrow('Unauthorized');
  });
});
