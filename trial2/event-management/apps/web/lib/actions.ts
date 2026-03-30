'use server';

import { validateEnvVars } from '@event-management/shared';

// TRACED:EM-UI-002 — Server actions check response.ok before processing

function getApiUrl(): string {
  const url = process.env['API_URL'];
  if (!url) {
    validateEnvVars(['API_URL']);
  }
  return url ?? 'http://localhost:3001';
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Login failed' };
  }

  return response.json();
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const organizationId = formData.get('organizationId') as string;
  const role = formData.get('role') as string;
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, organizationId, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Registration failed' };
  }

  return response.json();
}

export async function fetchEvents(token: string) {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch events' };
  }

  return response.json();
}

export async function fetchVenues(token: string) {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/venues`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch venues' };
  }

  return response.json();
}

export async function fetchHealth() {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/health`);

  if (!response.ok) {
    return { error: 'Health check failed' };
  }

  return response.json();
}
