import { getDashboards } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: AE-FE-002
export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.data?.map((dashboard: { id: string; title: string; description?: string; status: string }) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{dashboard.title}</CardTitle>
                <Badge variant={dashboard.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {dashboard.status}
                </Badge>
              </div>
              {dashboard.description && (
                <CardDescription>{dashboard.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
        {(!dashboards.data || dashboards.data.length === 0) && (
          <p className="col-span-full text-center text-[var(--muted-foreground)]">
            No dashboards found. Create your first dashboard.
          </p>
        )}
      </div>
    </div>
  );
}
