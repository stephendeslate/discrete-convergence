// TRACED:WEB-DATASOURCES — Data sources page with list and create form
import { cookies } from 'next/headers';
import { DataSourceList } from '../../components/data-source-list';
import { CreateDataSourceForm } from '../../components/create-data-source-form';

async function getDataSources(token: string) {
  const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${API_BASE}/data-sources`, {
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

export default async function DataSourcesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="text-center mt-16">
        <h1 className="text-2xl font-bold mb-4">Data Sources</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to manage data sources.</p>
        <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
      </div>
    );
  }

  const dataSources = await getDataSources(token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Sources</h1>
      </div>
      <CreateDataSourceForm token={token} />
      <DataSourceList dataSources={dataSources} token={token} />
    </div>
  );
}
