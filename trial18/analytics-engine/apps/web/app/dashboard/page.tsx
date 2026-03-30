import { getDashboards } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: AE-FE-002 — Dashboard page fetches via getDashboards server action with auth token

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export default async function DashboardPage() {
  const result = await getDashboards();
  const dashboards: Dashboard[] = result.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboards</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{dashboard.title}</CardTitle>
                <Badge variant={dashboard.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {dashboard.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{dashboard.description ?? 'No description'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
