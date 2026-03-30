// TRACED:WEB-DASHBOARD — Dashboard page with list and create form
import { cookies } from 'next/headers';
import { DashboardList } from '../../components/dashboard-list';
import { CreateDashboardForm } from '../../components/create-dashboard-form';

async function getDashboards(token: string) {
  const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${API_BASE}/dashboards`, {
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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="text-center mt-16">
        <h1 className="text-2xl font-bold mb-4">Dashboards</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your dashboards.</p>
        <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
      </div>
    );
  }

  const dashboards = await getDashboards(token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboards</h1>
      </div>
      <CreateDashboardForm token={token} />
      <DashboardList dashboards={dashboards} token={token} />
    </div>
  );
}
