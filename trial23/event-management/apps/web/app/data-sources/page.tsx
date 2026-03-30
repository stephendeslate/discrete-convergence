import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Sources</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connected Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data sources configured. Add a source to start importing data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
