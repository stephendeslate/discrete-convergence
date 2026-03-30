import { getDashboards } from '@/lib/actions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// TRACED: AE-UI-004
export default async function DashboardPage() {
  const data = await getDashboards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items?.map(
          (dashboard: { id: string; name: string; description: string; status: string }) => (
            <Card key={dashboard.id}>
              <h3 className="text-lg font-semibold">{dashboard.name}</h3>
              <p className="text-[var(--muted-foreground)]">
                {dashboard.description}
              </p>
              <Badge>{dashboard.status}</Badge>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
