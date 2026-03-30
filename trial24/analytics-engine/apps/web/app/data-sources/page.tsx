// TRACED:WEB-DATASOURCES — Data source list page
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api';
import { DataSourceList } from '@/components/data-source-list';

interface DataSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: DataSource[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default async function DataSourcesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please <a href="/login" className="text-blue-600 underline">sign in</a> to view data sources.</p>
      </div>
    );
  }

  let dataSources: DataSource[] = [];
  let error: string | null = null;

  try {
    const result = await apiClient<PaginatedResponse>('/data-sources', { token });
    dataSources = result.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data sources';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Sources</h1>
      </div>
      {error && <div role="alert" className="rounded bg-red-50 p-3 text-red-700 mb-4">{error}</div>}
      <DataSourceList dataSources={dataSources} />
    </div>
  );
}
