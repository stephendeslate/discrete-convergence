import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DataSourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <Button>Add Data Source</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>No data sources configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Connect your first data source to start building dashboards.
            </p>
            <div className="mt-2">
              <Badge>REST API</Badge>
              <Badge className="ml-2">PostgreSQL</Badge>
              <Badge className="ml-2">CSV</Badge>
              <Badge className="ml-2">Webhook</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
