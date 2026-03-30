import { getDataSources } from '@/lib/actions';

export default async function DataSourcesPage() {
  const { data } = await getDataSources();
  const sources = data as Array<{ id: string; name: string; type: string; isActive: boolean; lastSyncAt?: string }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Sources</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sources.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : 'Never'}</td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No data sources configured</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
