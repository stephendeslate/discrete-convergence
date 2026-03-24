// TRACED:AE-FE-ACT-001 — Server actions with getToken() and Authorization: Bearer header
'use server';

import { redirect } from 'next/navigation';
import { getToken, setTokens, clearTokens } from './auth';

const API_URL = process.env['API_URL'] ?? 'http://localhost:4000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const correlationId = crypto.randomUUID();
  headers['X-Correlation-ID'] = correlationId;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (response.status === 401) {
    await clearTokens();
    redirect('/login');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// --- Auth Actions ---

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setTokens(data.accessToken, data.refreshToken);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
  }
}

export async function registerAction(
  email: string,
  password: string,
  role: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string; data?: RegisterResponse }> {
  try {
    const data = await apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, tenantId }),
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearTokens();
  redirect('/login');
}

// --- Dashboard Actions ---

interface Dashboard {
  id: string;
  title: string;
  description: string | null;
  status: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getDashboards(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Dashboard>> {
  return apiFetch<PaginatedResponse<Dashboard>>(
    `/dashboards?page=${page}&limit=${limit}`,
  );
}

export async function getDashboard(id: string): Promise<Dashboard & { widgets: Widget[] }> {
  return apiFetch<Dashboard & { widgets: Widget[] }>(`/dashboards/${id}`);
}

export async function createDashboard(
  title: string,
  description?: string,
): Promise<Dashboard> {
  return apiFetch<Dashboard>('/dashboards', {
    method: 'POST',
    body: JSON.stringify({ title, description, status: 'DRAFT' }),
  });
}

export async function updateDashboard(
  id: string,
  data: { title?: string; description?: string; status?: string },
): Promise<Dashboard> {
  return apiFetch<Dashboard>(`/dashboards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDashboard(id: string): Promise<void> {
  await apiFetch<void>(`/dashboards/${id}`, { method: 'DELETE' });
}

// --- Data Source Actions ---

interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getDataSources(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<DataSource>> {
  return apiFetch<PaginatedResponse<DataSource>>(
    `/data-sources?page=${page}&limit=${limit}`,
  );
}

export async function createDataSource(
  name: string,
  type: string,
  config?: Record<string, unknown>,
): Promise<DataSource> {
  return apiFetch<DataSource>('/data-sources', {
    method: 'POST',
    body: JSON.stringify({ name, type, config }),
  });
}

export async function deleteDataSource(id: string): Promise<void> {
  await apiFetch<void>(`/data-sources/${id}`, { method: 'DELETE' });
}

// --- Widget Actions ---

interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  dashboardId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getWidgets(
  dashboardId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Widget>> {
  return apiFetch<PaginatedResponse<Widget>>(
    `/widgets?dashboardId=${dashboardId}&page=${page}&limit=${limit}`,
  );
}

export async function createWidget(
  dashboardId: string,
  type: string,
  title: string,
  config?: Record<string, unknown>,
): Promise<Widget> {
  return apiFetch<Widget>('/widgets', {
    method: 'POST',
    body: JSON.stringify({ dashboardId, type, title, config }),
  });
}

export async function deleteWidget(id: string): Promise<void> {
  await apiFetch<void>(`/widgets/${id}`, { method: 'DELETE' });
}

// Session helper that decodes JWT payload for display
export async function getSession(): Promise<{ token: string; email: string; role: string } | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return { token, email: payload.email ?? '', role: payload.role ?? '' };
  } catch {
    return null;
  }
}

