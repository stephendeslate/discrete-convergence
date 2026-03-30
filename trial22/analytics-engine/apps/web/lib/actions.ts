'use server';

import { cookies } from 'next/headers';

// TRACED: AE-FE-006
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginAction(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return { error: 'Invalid credentials' };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
    });
    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
    });
    return {};
  } catch {
    return { error: 'Login failed' };
  }
}

export async function registerAction(
  email: string,
  password: string,
  name: string,
): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'USER', tenantId: 'default' }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.message ?? 'Registration failed' };
    }
    return {};
  } catch {
    return { error: 'Registration failed' };
  }
}

export async function getDashboards(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboards?page=${page}&limit=${limit}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    return { data: [], total: 0 };
  }
  return res.json();
}

export async function getDataSources(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/data-sources?page=${page}&limit=${limit}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    return { data: [], total: 0 };
  }
  return res.json();
}

export async function createDashboard(title: string, description?: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dashboard');
  }
  return res.json();
}

export async function deleteDashboard(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboards/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    throw new Error('Failed to delete dashboard');
  }
  return res.json();
}
