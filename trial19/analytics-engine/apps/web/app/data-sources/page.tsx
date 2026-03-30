import { getDataSources } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Data Sources</h1>
      </div>
      <Separator />
      {dataSources.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No data sources configured.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Data source list">
          {dataSources.map((ds: { id: string; name: string; type: string; connectionStatus: string }) => (
            <Card key={ds.id} role="listitem">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{ds.name}</CardTitle>
                <Badge variant={ds.connectionStatus === 'CONNECTED' ? 'default' : 'destructive'}>
                  {ds.connectionStatus}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">Type: {ds.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
