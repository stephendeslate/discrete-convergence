'use server';

// TRACED:FD-WEB-003 — Server actions for fleet dispatch
// TRACED:FD-WEB-004 — Write actions with POST/PUT/DELETE
// TRACED:FD-ACT-001 — Server actions export createVehicle
// TRACED:FD-ACT-002 — Server actions export createDispatch
// TRACED:FD-ACT-003 — Server actions export deleteVehicle
// TRACED:FD-ACT-004 — Server actions export loginAction
// TRACED:FD-ACT-005 — Server actions export registerAction

import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

async function serverFetch(path: string, options: {
  method: string;
  body?: unknown;
  token?: string;
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

// TRACED:FD-WEB-005 — POST write action: create vehicle
export async function createVehicle(formData: FormData, token: string) {
  const data = {
    name: formData.get('name') as string,
    plateNumber: formData.get('plateNumber') as string,
    type: formData.get('type') as string,
    capacity: Number(formData.get('capacity')),
  };

  return serverFetch('/vehicles', { method: 'POST', body: data, token });
}

// TRACED:FD-WEB-006 — POST write action: create dispatch
export async function createDispatch(formData: FormData, token: string) {
  const data = {
    vehicleId: formData.get('vehicleId') as string,
    driverId: formData.get('driverId') as string,
    routeId: formData.get('routeId') as string,
    scheduledAt: formData.get('scheduledAt') as string,
  };

  return serverFetch('/dispatches', { method: 'POST', body: data, token });
}

// TRACED:FD-WEB-007 — DELETE write action: delete vehicle
export async function deleteVehicle(id: string, token: string) {
  return serverFetch(`/vehicles/${id}`, { method: 'DELETE', token });
}

// TRACED:FD-WEB-008 — PATCH write action: assign dispatch
export async function assignDispatch(id: string, token: string) {
  return serverFetch(`/dispatches/${id}/assign`, { method: 'PATCH', token });
}

// TRACED:FD-WEB-009 — PATCH write action: complete dispatch
export async function completeDispatch(id: string, token: string) {
  return serverFetch(`/dispatches/${id}/complete`, { method: 'PATCH', token });
}

// TRACED:FD-WEB-010 — PUT write action: update vehicle
export async function updateVehicle(id: string, formData: FormData, token: string) {
  const data = {
    name: formData.get('name') as string,
    plateNumber: formData.get('plateNumber') as string,
    type: formData.get('type') as string,
    capacity: Number(formData.get('capacity')),
  };

  return serverFetch(`/vehicles/${id}`, { method: 'PUT', body: data, token });
}

export async function loginAction(email: string, password: string) {
  const result = await serverFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  // Store token in HTTP-only cookie after login
  if (result.accessToken) {
    const cookieStore = await cookies();
    cookieStore.set('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    if (result.refreshToken) {
      cookieStore.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  return result;
}

export async function registerAction(email: string, password: string, tenantId: string) {
  const result = await serverFetch('/auth/register', {
    method: 'POST',
    body: { email, password, tenantId },
  });

  // Store token in HTTP-only cookie after registration
  if (result.accessToken) {
    const cookieStore = await cookies();
    cookieStore.set('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    if (result.refreshToken) {
      cookieStore.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  return result;
}
