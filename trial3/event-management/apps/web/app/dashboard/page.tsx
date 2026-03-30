import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const StatsCards = dynamic(
  () => import('@/components/dashboard-stats').then((mod) => mod.DashboardStats),
  { loading: () => <Skeleton className="h-32 w-full" /> },
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <StatsCards />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">No recent events to display</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">No recent registrations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
