import dynamic from 'next/dynamic';
import { Skeleton } from '../../components/ui/skeleton';

const DashboardContent = dynamic(() => import('../../components/dashboard-content'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardContent />
    </div>
  );
}
