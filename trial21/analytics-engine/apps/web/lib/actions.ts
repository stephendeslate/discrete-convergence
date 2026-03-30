'use server';

import { cookies } from 'next/headers';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

/**
 * Login server action.
 * VERIFY: AE-FI-001 — login sets httpOnly secure cookie with access token
 */
export async function loginAction(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { success: false, error: 'Invalid credentials' }; // TRACED: AE-FI-004
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' }); // TRACED: AE-FI-001
    cookieStore.set('refresh_token', data.refresh_token, { httpOnly: true, secure: true, path: '/' });

    return { success: true };
  } catch {
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Register server action.
 * VERIFY: AE-FI-002 — registration sets httpOnly secure cookie
 */
export async function registerAction(
  email: string,
  password: string,
  name: string,
  tenantName: string,
  role: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, tenantName, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message ?? 'Registration failed' };
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' }); // TRACED: AE-FI-002

    return { success: true };
  } catch {
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Fetch with authentication token from cookies.
 * VERIFY: AE-FI-003 — protected actions read token from cookie and send Bearer header
 */
async function authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token.value}` } : {}), // TRACED: AE-FI-003
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });
}

export async function getDashboards(): Promise<{ data: unknown[]; total: number }> {
  const response = await authenticatedFetch('/dashboards');
  if (!response.ok) {
    return { data: [], total: 0 };
  }
  return response.json();
}

export async function getDashboard(id: string): Promise<unknown> {
  const response = await authenticatedFetch(`/dashboards/${id}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function createDashboard(title: string, description?: string): Promise<{ success: boolean; error?: string }> {
  const response = await authenticatedFetch('/dashboards', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create dashboard' };
  }
  return { success: true };
}

export async function getDataSources(): Promise<{ data: unknown[]; total: number }> {
  const response = await authenticatedFetch('/data-sources');
  if (!response.ok) {
    return { data: [], total: 0 };
  }
  return response.json();
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refresh_token');
}
