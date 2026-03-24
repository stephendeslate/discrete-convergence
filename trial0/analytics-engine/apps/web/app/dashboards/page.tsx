import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// TRACED:AE-FE-008 — next/dynamic for code splitting with Skeleton loading
const DashboardList = dynamic(() => import('@/components/ui/dashboard-list'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function DashboardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboards</h1>
        <Button>Create Dashboard</Button>
      </div>
      <DashboardList />
    </div>
  );
}
