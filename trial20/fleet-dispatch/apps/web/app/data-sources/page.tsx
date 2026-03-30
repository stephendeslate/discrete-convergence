import { fetchDataSources } from '@/lib/actions';
import { Card } from '@/components/ui/card';

// TRACED: FD-CROSS-002
export default async function DataSourcesPage() {
  const dataSources = await fetchDataSources();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Data Sources</h1>
      <Card>
        {Array.isArray(dataSources) && dataSources.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No data sources configured yet.</p>
        ) : (
          <p>Data sources will appear here when configured.</p>
        )}
      </Card>
    </div>
  );
}
