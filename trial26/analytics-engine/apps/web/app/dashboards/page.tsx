import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function DashboardsPage() {
  const dashboards = [
    { id: '1', name: 'Sales Overview', status: 'published', widgetCount: 4 },
    { id: '2', name: 'User Analytics', status: 'draft', widgetCount: 2 },
    { id: '3', name: 'System Metrics', status: 'archived', widgetCount: 6 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Dashboards</h2>
        <Link href="/dashboards/new">
          <Button>Create Dashboard</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{d.name}</CardTitle>
                <Badge variant={d.status === 'published' ? 'success' : d.status === 'draft' ? 'default' : 'warning'}>
                  {d.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">{d.widgetCount} widgets</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
