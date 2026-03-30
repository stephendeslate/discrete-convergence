// TRACED:AE-WEB-API-001 — API client for communicating with the analytics engine backend

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

/**
 * Make an authenticated API request.
 * TRACED:AE-WEB-API-002 — Fetch wrapper with auth
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(
      typeof errorData.message === 'string'
        ? errorData.message
        : `API error: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Auth API methods.
 */
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: { email, password },
    }),

  refresh: (refreshToken: string) =>
    apiFetch<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
};

/**
 * Dashboard API methods.
 */
export const dashboardApi = {
  list: (token: string) =>
    apiFetch<{ data: unknown[]; meta: unknown }>('/dashboards', { token }),

  get: (id: string, token: string) =>
    apiFetch<unknown>(`/dashboards/${id}`, { token }),

  create: (name: string, token: string, description?: string) =>
    apiFetch<unknown>('/dashboards', {
      method: 'POST',
      body: { name, description },
      token,
    }),

  update: (id: string, data: Record<string, unknown>, token: string) =>
    apiFetch<unknown>(`/dashboards/${id}`, {
      method: 'PUT',
      body: data,
      token,
    }),

  remove: (id: string, token: string) =>
    apiFetch<unknown>(`/dashboards/${id}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Widget API methods.
 */
export const widgetApi = {
  list: (token: string) =>
    apiFetch<{ data: unknown[]; meta: unknown }>('/widgets', { token }),

  get: (id: string, token: string) =>
    apiFetch<unknown>(`/widgets/${id}`, { token }),

  create: (data: Record<string, unknown>, token: string) =>
    apiFetch<unknown>('/widgets', {
      method: 'POST',
      body: data,
      token,
    }),

  getData: (id: string, token: string) =>
    apiFetch<unknown>(`/widgets/${id}/data`, { token }),
};

/**
 * Data source API methods.
 */
/**
 * Generic API client alias.
 * TRACED:AE-WEB-API-003 — apiClient generic wrapper
 */
export async function apiClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return apiFetch<T>(path, options);
}

/**
 * Data source API methods.
 */
export const dataSourceApi = {
  list: (token: string) =>
    apiFetch<{ data: unknown[]; meta: unknown }>('/data-sources', { token }),

  create: (data: Record<string, unknown>, token: string) =>
    apiFetch<unknown>('/data-sources', {
      method: 'POST',
      body: data,
      token,
    }),

  sync: (id: string, token: string) =>
    apiFetch<unknown>(`/data-sources/${id}/sync`, {
      method: 'POST',
      token,
    }),

  testConnection: (id: string, token: string) =>
    apiFetch<unknown>(`/data-sources/${id}/test-connection`, {
      method: 'POST',
      token,
    }),
};
