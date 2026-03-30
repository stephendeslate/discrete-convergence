import dynamic from 'next/dynamic';
import { getDataSources } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DataSourceTable = dynamic(
  () => import('@/components/data-source-table'),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

interface DataSource {
  id: string;
  name: string;
  type?: string;
  status?: string;
}

export default async function DataSourcesPage() {
  const result = await getDataSources();

  const dataSources: DataSource[] = result.success && Array.isArray(result.data) ? result.data : [];

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Sources</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Connect and manage your data sources
          </p>
        </div>
        <Badge variant="secondary">{dataSources.length} connected</Badge>
      </div>

      {dataSources.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No data sources</CardTitle>
            <CardDescription>Connect a data source to start collecting analytics.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <DataSourceTable dataSources={dataSources} />
      )}
    </section>
  );
}
