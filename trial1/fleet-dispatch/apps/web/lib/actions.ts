// TRACED:FD-FE-006 — Server actions for form submissions
'use server';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

async function postToApi(
  path: string,
  payload: Record<string, unknown>,
  authToken?: string,
): Promise<ActionResult> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = (body as { message?: string })?.message;
      return { success: false, error: message ?? `Request to ${path} failed` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch {
    return { success: false, error: `Network error while calling ${path}` };
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  return postToApi('/auth/login', {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    companyId: formData.get('companyId') as string,
  });
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  return postToApi('/auth/register', {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    role: formData.get('role') as string,
    companyId: formData.get('companyId') as string,
  });
}

export async function createWorkOrderAction(
  token: string,
  formData: FormData,
): Promise<ActionResult> {
  return postToApi(
    '/work-orders',
    {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as string,
    },
    token,
  );
}
