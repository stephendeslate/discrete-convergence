// TRACED:EM-FE-004 — Auth helper utilities for client-side session checks
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export async function requireAuth(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    throw new Error('Unauthorized');
  }
  try {
    return JSON.parse(session) as SessionUser;
  } catch {
    throw new Error('Invalid session');
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get('token')?.value;
}

export function hasRole(user: SessionUser, roles: string[]): boolean {
  return roles.includes(user.role);
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === 'ADMIN';
}

export function isOrganizer(user: SessionUser): boolean {
  return user.role === 'ADMIN' || user.role === 'ORGANIZER';
}
