import dynamic from 'next/dynamic';

// TRACED:AE-FE-006 — next/dynamic for code splitting with Skeleton loading
const DashboardList = dynamic(() => import('@/components/dashboard-list'), {
  loading: () => (
    <div role="status" aria-busy="true" className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-24 bg-[var(--muted)] rounded-lg animate-pulse" />
      ))}
      <span className="sr-only">Loading dashboards...</span>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition">
          Create Dashboard
        </button>
      </div>
      <DashboardList />
    </div>
  );
}
