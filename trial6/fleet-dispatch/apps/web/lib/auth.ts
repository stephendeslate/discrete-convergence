import { cookies } from 'next/headers';

const TOKEN_COOKIE = 'fd-token';

export interface SessionPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64').toString(),
    ) as SessionPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export function hasRole(session: SessionPayload | null, ...roles: string[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}

export function isAdmin(session: SessionPayload | null): boolean {
  return hasRole(session, 'ADMIN');
}

export function isDispatcher(session: SessionPayload | null): boolean {
  return hasRole(session, 'DISPATCHER', 'ADMIN');
}
