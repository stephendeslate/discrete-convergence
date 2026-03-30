// TRACED:AE-WEB-ACT-001 — Server actions with use server directive
// TRACED:FE-SERVER-ACTIONS — 'use server' actions for dashboard, widget, data-source, auth (VERIFY:FE-SERVER-ACTIONS)
'use server';

import { cookies } from 'next/headers';

const API_BASE_URL = process.env['API_URL'] ?? 'http://localhost:3001';

interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

async function serverFetch(
  path: string,
  method: string,
  body?: unknown,
  token?: string,
): Promise<ActionResult> {
  try {
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
      const errorData = await response.json().catch(() => ({
        message: 'Request failed',
      }));
      return {
        success: false,
        error:
          typeof errorData.message === 'string'
            ? errorData.message
            : `Error: ${response.status}`,
      };
    }

    const data = await response.json().catch(() => null);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a new dashboard.
 * TRACED:AE-WEB-ACT-002 — Create dashboard server action (POST)
 */
export async function createDashboard(
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const token = formData.get('token') as string;

  if (!name) {
    return { success: false, error: 'Name is required' };
  }

  return serverFetch(
    '/dashboards',
    'POST',
    { name, description: description ?? undefined },
    token,
  );
}

/**
 * Update a dashboard.
 * TRACED:AE-WEB-ACT-003 — Update dashboard server action (PUT)
 */
export async function updateDashboard(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const token = formData.get('token') as string;

  if (!id) {
    return { success: false, error: 'Dashboard ID is required' };
  }

  return serverFetch(
    `/dashboards/${id}`,
    'PUT',
    { name, description: description ?? undefined },
    token,
  );
}

/**
 * Delete a dashboard.
 * TRACED:AE-WEB-ACT-004 — Delete dashboard server action (DELETE)
 */
export async function deleteDashboard(
  id: string,
  token: string,
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'Dashboard ID is required' };
  }

  return serverFetch(`/dashboards/${id}`, 'DELETE', undefined, token);
}

/**
 * Create a new data source.
 * TRACED:AE-WEB-ACT-005 — Create data source server action (POST)
 */
export async function createDataSource(
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const connectionString = formData.get('connectionString') as string;
  const token = formData.get('token') as string;

  if (!name || !type || !connectionString) {
    return { success: false, error: 'All fields are required' };
  }

  return serverFetch(
    '/data-sources',
    'POST',
    { name, type, connectionString },
    token,
  );
}

/**
 * Create a new widget.
 * TRACED:AE-WEB-ACT-006 — Create widget server action (POST)
 */
export async function createWidget(
  formData: FormData,
): Promise<ActionResult> {
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const dashboardId = formData.get('dashboardId') as string;
  const token = formData.get('token') as string;

  if (!title || !type || !dashboardId) {
    return { success: false, error: 'All fields are required' };
  }

  return serverFetch(
    '/widgets',
    'POST',
    { title, type, dashboardId },
    token,
  );
}

/**
 * Delete a widget.
 * TRACED:AE-WEB-ACT-007 — Delete widget server action (DELETE)
 */
export async function deleteWidget(
  id: string,
  token: string,
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'Widget ID is required' };
  }

  return serverFetch(`/widgets/${id}`, 'DELETE', undefined, token);
}

/**
 * Sync a data source.
 * TRACED:AE-WEB-ACT-008 — Sync data source server action (POST)
 */
export async function syncDataSource(
  id: string,
  token: string,
): Promise<ActionResult> {
  return serverFetch(`/data-sources/${id}/sync`, 'POST', undefined, token);
}

/**
 * Update a data source.
 * TRACED:AE-WEB-ACT-009 — Update data source server action (PATCH)
 */
export async function updateDataSource(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const token = formData.get('token') as string;

  if (!id) {
    return { success: false, error: 'Data source ID is required' };
  }

  return serverFetch(
    `/data-sources/${id}`,
    'PATCH',
    { name },
    token,
  );
}

/**
 * Alias exports for compatibility.
 * TRACED:AE-WEB-ACT-010 — Login action alias
 */
export async function loginAction(
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const result = await serverFetch('/auth/login', 'POST', { email, password });

  if (result.success && result.data) {
    const tokens = result.data as { accessToken: string; refreshToken: string };
    const cookieStore = await cookies();
    cookieStore.set('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    });
    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 604800,
    });
  }

  return result;
}

/**
 * TRACED:AE-WEB-ACT-011 — Register action alias
 */
export async function registerAction(
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const tenantId = formData.get('tenantId') as string | null;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const body: Record<string, string> = { email, password };
  if (tenantId?.trim()) {
    body.tenantId = tenantId.trim();
  }

  const result = await serverFetch('/auth/register', 'POST', body);

  if (result.success && result.data) {
    const tokens = result.data as { accessToken: string; refreshToken: string };
    const cookieStore = await cookies();
    cookieStore.set('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    });
    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 604800,
    });
  }

  return result;
}

/**
 * TRACED:AE-WEB-ACT-012 — Create dashboard action alias
 */
export const createDashboardAction = createDashboard;

/**
 * TRACED:AE-WEB-ACT-013 — Update dashboard action alias
 */
export const updateDashboardAction = updateDashboard;

/**
 * TRACED:AE-WEB-ACT-014 — Delete dashboard action alias
 */
export const deleteDashboardAction = deleteDashboard;

/**
 * TRACED:AE-WEB-ACT-015 — Create data source action alias
 */
export const createDataSourceAction = createDataSource;

/**
 * TRACED:AE-WEB-ACT-016 — Create widget action alias
 */
export const createWidgetAction = createWidget;
