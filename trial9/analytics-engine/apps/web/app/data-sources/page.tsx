import { getDataSources } from '@/lib/actions';

export default async function DataSourcesPage() {
  const data = await getDataSources();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Data Sources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.data.map((ds: { id: string; name: string; type: string }) => (
          <div key={ds.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--card)]">
            <h3 className="font-semibold text-[var(--card-foreground)]">{ds.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{ds.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
