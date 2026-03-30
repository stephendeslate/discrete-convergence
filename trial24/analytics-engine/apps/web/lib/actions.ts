// TRACED:WEB-ACTIONS — Server actions for data mutations
'use server';

import { cookies } from 'next/headers';
import { apiClient } from './api';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}

export async function loginAction(email: string, password: string) {
  const result = await apiClient<{ accessToken: string; refreshToken: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  const cookieStore = await cookies();
  cookieStore.set('auth-token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900,
  });

  return { success: true };
}

export async function registerAction(email: string, password: string, tenantId: string) {
  const result = await apiClient<{ accessToken: string; refreshToken: string }>('/auth/register', {
    method: 'POST',
    body: { email, password, tenantId },
  });

  const cookieStore = await cookies();
  cookieStore.set('auth-token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900,
  });

  return { success: true };
}

export async function createDashboardAction(name: string, description?: string) {
  const token = await getToken();
  return apiClient('/dashboards', {
    method: 'POST',
    body: { name, description },
    token,
  });
}

export async function updateDashboardAction(id: string, name: string, description?: string) {
  const token = await getToken();
  return apiClient(`/dashboards/${id}`, {
    method: 'PUT',
    body: { name, description },
    token,
  });
}

export async function deleteDashboardAction(id: string) {
  const token = await getToken();
  return apiClient(`/dashboards/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createDataSourceAction(name: string, type: string, connectionString: string) {
  const token = await getToken();
  return apiClient('/data-sources', {
    method: 'POST',
    body: { name, type, connectionString },
    token,
  });
}

export async function createWidgetAction(
  title: string,
  type: string,
  dashboardId: string,
  config?: Record<string, unknown>,
) {
  const token = await getToken();
  return apiClient('/widgets', {
    method: 'POST',
    body: { title, type, dashboardId, config },
    token,
  });
}
