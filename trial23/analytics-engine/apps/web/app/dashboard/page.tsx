import dynamic from 'next/dynamic';
import { getDashboards } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardTable = dynamic(
  () => import('@/components/dashboard-table'),
  { loading: () => <Skeleton className="h-64 w-full" /> },
);

export default async function DashboardPage() {
  const result = await getDashboards();

  const dashboards = result.success && Array.isArray(result.data) ? result.data : [];

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboards</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage and view your analytics dashboards
          </p>
        </div>
        <Badge variant="secondary">{dashboards.length} total</Badge>
      </div>

      {dashboards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No dashboards yet</CardTitle>
            <CardDescription>Create your first dashboard to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/dashboard">
              <Button type="button">Create Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <DashboardTable dashboards={dashboards} />
      )}
    </section>
  );
}
