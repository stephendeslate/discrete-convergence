'use server';

import { APP_VERSION, validateEnvVars } from '@analytics-engine/shared';

// TRACED:AE-UI-003 — Server Actions with 'use server' checking response.ok
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Login failed' };
  }

  const data = await response.json();
  return { data };
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const tenantName = formData.get('tenantName') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, tenantName }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Registration failed' };
  }

  const data = await response.json();
  return { data };
}

export async function fetchDashboards(token: string) {
  const response = await fetch(`${API_URL}/dashboards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { error: 'Failed to fetch dashboards' };
  }

  const data = await response.json();
  return { data };
}

export async function fetchDataSources(token: string) {
  const response = await fetch(`${API_URL}/data-sources`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { error: 'Failed to fetch data sources' };
  }

  const data = await response.json();
  return { data };
}

export async function getAppVersion() {
  return APP_VERSION;
}

// Use validateEnvVars from shared to validate frontend env vars
export async function checkEnv() {
  try {
    validateEnvVars(['API_URL']);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
