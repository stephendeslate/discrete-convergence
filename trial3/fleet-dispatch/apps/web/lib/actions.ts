'use server';

import { redirect } from 'next/navigation';
import { validateEnvVars } from '@fleet-dispatch/shared';

// TRACED:FD-UI-002
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyId = formData.get('companyId') as string;

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, companyId }),
  });

  if (response.ok) {
    redirect('/dashboard');
  }

  throw new Error('Invalid credentials');
}

export async function registerAction(formData: FormData): Promise<void> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL is not configured');
  }

  const body = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    role: formData.get('role') as string,
    companyId: formData.get('companyId') as string,
  };

  const response = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    redirect('/dashboard');
  }

  throw new Error('Registration failed');
}

export async function createWorkOrderAction(formData: FormData): Promise<void> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL is not configured');
  }

  const token = formData.get('token') as string;
  const body = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string,
  };

  const response = await fetch(`${apiUrl}/work-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    redirect('/work-orders');
  }

  throw new Error('Failed to create work order');
}
