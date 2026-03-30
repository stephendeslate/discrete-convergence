// TRACED:WEB-DASHBOARD — Dashboard list page
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api';
import { DashboardList } from '@/components/dashboard-list';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: Dashboard[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please <a href="/login" className="text-blue-600 underline">sign in</a> to view dashboards.</p>
      </div>
    );
  }

  let dashboards: Dashboard[] = [];
  let error: string | null = null;

  try {
    const result = await apiClient<PaginatedResponse>('/dashboards', { token });
    dashboards = result.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load dashboards';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboards</h1>
      </div>
      {error && <div role="alert" className="rounded bg-red-50 p-3 text-red-700 mb-4">{error}</div>}
      <DashboardList dashboards={dashboards} />
    </div>
  );
}
