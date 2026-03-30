import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const DashboardStats = dynamic(
  () => import('@/components/dashboard-stats'),
  { loading: () => <Skeleton className="h-32 w-full" /> },
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dispatch Dashboard</h1>
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No work orders to display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No active technicians.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
