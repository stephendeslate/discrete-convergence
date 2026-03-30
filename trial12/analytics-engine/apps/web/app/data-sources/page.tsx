import { getDataSources } from '@/lib/actions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function DataSourcesPage() {
  const data = await getDataSources();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Sources</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.items?.map(
          (ds: { id: string; name: string; type: string; status: string }) => (
            <Card key={ds.id}>
              <h3 className="text-lg font-semibold">{ds.name}</h3>
              <div className="flex gap-2">
                <Badge>{ds.type}</Badge>
                <Badge>{ds.status}</Badge>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
