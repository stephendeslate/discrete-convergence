import { getDataSources } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: AE-FE-004
export default async function DataSourcesPage() {
  const sources = await getDataSources();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Data Sources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.data?.map((source: { id: string; name: string; type: string }) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{source.name}</CardTitle>
                <Badge>{source.type}</Badge>
              </div>
              <CardDescription>Connected data source</CardDescription>
            </CardHeader>
          </Card>
        ))}
        {(!sources.data || sources.data.length === 0) && (
          <p className="col-span-full text-center text-[var(--muted-foreground)]">
            No data sources configured.
          </p>
        )}
      </div>
    </div>
  );
}
