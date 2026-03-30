import { getDataSources } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: AE-FE-004 — Data sources page fetches via getDataSources server action with auth token

interface DataSource {
  id: string;
  name: string;
  type: string;
}

export default async function DataSourcesPage() {
  const result = await getDataSources();
  const dataSources: DataSource[] = result.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((ds) => (
          <Card key={ds.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{ds.name}</CardTitle>
                <Badge>{ds.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Type: {ds.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
