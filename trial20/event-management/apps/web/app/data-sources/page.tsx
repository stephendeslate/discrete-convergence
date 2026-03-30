import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Sources</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connected Sources</CardTitle>
          <CardDescription>Manage your data source connections</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data sources configured. Configure data sources through the API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
