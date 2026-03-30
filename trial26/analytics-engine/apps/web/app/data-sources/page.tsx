import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function DataSourcesPage() {
  const sources = [
    { id: '1', name: 'Production DB', type: 'postgresql', status: 'active' },
    { id: '2', name: 'Warehouse', type: 'bigquery', status: 'active' },
    { id: '3', name: 'Legacy API', type: 'rest_api', status: 'paused' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Data Sources</h2>
        <Button>Add Data Source</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <Badge variant={s.status === 'active' ? 'success' : 'warning'}>{s.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type: {s.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
