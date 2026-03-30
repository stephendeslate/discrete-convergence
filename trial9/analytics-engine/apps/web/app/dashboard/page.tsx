import { getDashboards, createDashboard } from '@/lib/actions';
import dynamic from 'next/dynamic';

const DashboardList = dynamic(
  () => import('@/components/dashboard-list'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded bg-[var(--muted)]" />
        <div className="h-24 rounded bg-[var(--muted)]" />
      </div>
    ),
  },
);

// TRACED: AE-UI-004
export default async function DashboardPage() {
  const data = await getDashboards();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboards</h1>
        <form action={createDashboard}>
          <input name="title" placeholder="Dashboard title" required className="mr-2 rounded border border-[var(--border)] px-3 py-1 text-sm" />
          <button type="submit" className="rounded bg-[var(--primary)] px-4 py-1 text-sm text-[var(--primary-foreground)]">
            Create
          </button>
        </form>
      </div>
      <DashboardList dashboards={data.data} />
    </div>
  );
}
