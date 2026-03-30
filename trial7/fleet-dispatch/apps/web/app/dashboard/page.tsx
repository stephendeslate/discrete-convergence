import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('@/components/dashboard-content'), {
  loading: () => <div className="h-64 animate-pulse rounded bg-gray-200" />,
});

export default function DashboardPage() {
  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <DashboardContent />
    </div>
  );
}
