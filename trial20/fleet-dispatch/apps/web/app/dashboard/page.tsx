import { fetchDashboards } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: FD-CROSS-001
export default async function DashboardPage() {
  const dashboards = await fetchDashboards();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Total Dashboards</h2>
          <p className="mt-1 text-3xl font-bold">{Array.isArray(dashboards) ? dashboards.length : 0}</p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Active Dispatches</h2>
          <p className="mt-1 text-3xl font-bold">
            <Badge variant="default">Live</Badge>
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Fleet Status</h2>
          <p className="mt-1 text-3xl font-bold">Operational</p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">System Health</h2>
          <p className="mt-1 text-3xl font-bold">
            <Badge variant="success">Healthy</Badge>
          </p>
        </Card>
      </div>
    </div>
  );
}
