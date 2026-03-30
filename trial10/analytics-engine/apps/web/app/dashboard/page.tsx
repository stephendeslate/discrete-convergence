import { getDashboards } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: AE-UI-005
export default async function DashboardPage() {
  const data = await getDashboards();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboards</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <CardTitle>{dashboard.title}</CardTitle>
              <CardDescription>{dashboard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={dashboard.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {dashboard.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">Total: {data.total} dashboards</p>
    </div>
  );
}
