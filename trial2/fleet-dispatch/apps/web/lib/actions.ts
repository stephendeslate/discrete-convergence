'use server';

import { redirect } from 'next/navigation';
import { validateEnvVars } from '@fleet-dispatch/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

/**
 * Server action for login.
 * TRACED:FD-UI-002
 */
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  redirect('/dashboard');
}

/**
 * Server action for registration.
 */
export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as string;
  const companyId = formData.get('companyId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName, role, companyId }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/dashboard');
}

/**
 * Server action to fetch work orders.
 */
export async function fetchWorkOrders(token: string): Promise<unknown> {
  const response = await fetch(`${API_URL}/work-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch work orders');
  }

  return response.json();
}

/**
 * Server action to fetch invoices.
 */
export async function fetchInvoices(token: string): Promise<unknown> {
  const response = await fetch(`${API_URL}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
}
