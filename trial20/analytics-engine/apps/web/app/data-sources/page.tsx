import { getDataSources } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TRACED: AE-FE-015 — Data sources list page with server-side data fetching
export default async function DataSourcesPage() {
  const { data, error } = await getDataSources();

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <p className="text-[var(--muted-foreground)]">
          Please <a href="/login" className="underline">sign in</a> to view data sources.
        </p>
      </div>
    );
  }

  const sources = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <Button>Add Data Source</Button>
      </div>

      {sources.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No data sources configured.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((ds: { id: string; name: string; type: string; status: string }) => (
            <Card key={ds.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ds.name}</CardTitle>
                  <Badge variant={ds.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {ds.status}
                  </Badge>
                </div>
                <CardDescription>Type: {ds.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
