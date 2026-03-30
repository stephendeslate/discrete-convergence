import { getDataSources } from '@/lib/actions';

export default async function DataSourcesPage() {
  const result = await getDataSources();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Data Sources</h1>
      <div className="border border-[var(--border)] rounded-lg p-6">
        <p className="text-[var(--muted-foreground)]">{result.data.length} data sources configured.</p>
      </div>
    </div>
  );
}
