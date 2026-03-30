import { cookies } from 'next/headers';

// TRACED:AE-UI-003
export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function getSession(): Promise<{ token: string } | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }
  return { token };
}
