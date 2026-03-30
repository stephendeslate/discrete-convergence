'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
  });
  return data;
}

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
  });
  return data;
}

export async function createDashboard(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  return apiRequest('/dashboards', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateDashboard(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  return apiRequest(`/dashboards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteDashboard(id: string) {
  return apiRequest(`/dashboards/${id}`, { method: 'DELETE' });
}

export async function createDataSource(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const connectionString = formData.get('connectionString') as string;
  return apiRequest('/data-sources', {
    method: 'POST',
    body: JSON.stringify({ name, type, connectionString }),
  });
}

export async function updateDataSource(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  return apiRequest(`/data-sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, type }),
  });
}

export async function deleteDataSource(id: string) {
  return apiRequest(`/data-sources/${id}`, { method: 'DELETE' });
}

export async function createWidget(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const dashboardId = formData.get('dashboardId') as string;
  const dataSourceId = formData.get('dataSourceId') as string;
  return apiRequest('/widgets', {
    method: 'POST',
    body: JSON.stringify({ name, type, dashboardId, dataSourceId, config: {} }),
  });
}

export async function deleteWidget(id: string) {
  return apiRequest(`/widgets/${id}`, { method: 'DELETE' });
}
