import { getDataSources } from '@/lib/actions';

export default async function DataSourcesPage() {
  const result = await getDataSources();
  const dataSources = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Data Sources</h1>
      {dataSources.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No data sources configured.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {dataSources.map((ds: { id: string; name: string; type: string }) => (
            <li key={ds.id} className="border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-lg font-semibold">{ds.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Type: {ds.type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
