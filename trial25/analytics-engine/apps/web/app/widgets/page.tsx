// TRACED:WEB-WIDGETS — Widgets page with list and create form
import { cookies } from 'next/headers';
import { WidgetList } from '../../components/widget-list';
import { CreateWidgetForm } from '../../components/create-widget-form';

async function getWidgets(token: string) {
  const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${API_BASE}/widgets`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function WidgetsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="text-center mt-16">
        <h1 className="text-2xl font-bold mb-4">Widgets</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to manage widgets.</p>
        <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
      </div>
    );
  }

  const widgets = await getWidgets(token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Widgets</h1>
      </div>
      <CreateWidgetForm token={token} />
      <WidgetList widgets={widgets} token={token} />
    </div>
  );
}
