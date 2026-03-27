// TRACED: AE-FE-009 — API key management

'use server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    return { error: err.message ?? 'Login failed' };
  }
  return res.json();
}

export async function registerAction(
  email: string,
  password: string,
  tenantName: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, tenantName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Registration failed' }));
    return { error: err.message ?? 'Registration failed' };
  }
  return res.json();
}

export async function fetchDashboards(token: string, page = 1, pageSize = 10) {
  const res = await fetch(
    `${API_URL}/dashboards?page=${page}&pageSize=${pageSize}`,
    { headers: getHeaders(token) },
  );
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function createDashboardAction(
  token: string,
  name: string,
  description: string,
) {
  const res = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Create failed' }));
    return { error: err.message ?? 'Create failed' };
  }
  return res.json();
}

export async function publishDashboardAction(token: string, id: string) {
  const res = await fetch(`${API_URL}/dashboards/${id}/publish`, {
    method: 'PATCH',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Publish failed' }));
    return { error: err.message ?? 'Publish failed' };
  }
  return res.json();
}

export async function deleteDashboardAction(token: string, id: string) {
  const res = await fetch(`${API_URL}/dashboards/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Delete failed' }));
    return { error: err.message ?? 'Delete failed' };
  }
  return { success: true };
}

export async function fetchDataSources(token: string, page = 1, pageSize = 10) {
  const res = await fetch(
    `${API_URL}/data-sources?page=${page}&pageSize=${pageSize}`,
    { headers: getHeaders(token) },
  );
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function createDataSourceAction(
  token: string,
  name: string,
  type: string,
  connectionConfig: Record<string, string>,
) {
  const res = await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name, type, connectionConfig }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Create failed' }));
    return { error: err.message ?? 'Create failed' };
  }
  return res.json();
}

export async function syncDataSourceAction(token: string, id: string) {
  const res = await fetch(`${API_URL}/data-sources/${id}/sync`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Sync failed' }));
    return { error: err.message ?? 'Sync failed' };
  }
  return res.json();
}

export async function fetchWidgets(token: string, dashboardId: string) {
  const res = await fetch(`${API_URL}/dashboards/${dashboardId}/widgets`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSyncHistory(
  token: string,
  dataSourceId: string,
  page = 1,
  pageSize = 10,
) {
  const res = await fetch(
    `${API_URL}/data-sources/${dataSourceId}/sync-history?page=${page}&pageSize=${pageSize}`,
    { headers: getHeaders(token) },
  );
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function fetchAuditLog(token: string, page = 1, pageSize = 10) {
  const res = await fetch(
    `${API_URL}/audit-log?page=${page}&pageSize=${pageSize}`,
    { headers: getHeaders(token) },
  );
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}
