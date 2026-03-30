import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardList = dynamic(() => import('@/components/dashboard-list'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

// TRACED:AE-FE-001
export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboards</h1>
      <DashboardList />
    </div>
  );
}
