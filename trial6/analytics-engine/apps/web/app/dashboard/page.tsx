import { getDashboards } from '@/lib/actions';
import { DashboardCard } from '@/components/dashboard-card';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';

export default async function DashboardListPage(): Promise<React.JSX.Element> {
  const response = await getDashboards();

  return (
    <>
      <AppHeader />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboards</h1>
            <p className="text-muted-foreground mt-1">
              Manage your analytics dashboards
            </p>
          </div>
          <Badge variant="secondary">{response.meta.total} total</Badge>
        </div>
        {response.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No dashboards yet. Create your first dashboard to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {response.data.map((dashboard) => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
