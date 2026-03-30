import { getDashboards } from '@/lib/actions';

export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-[var(--muted-foreground)] mb-4">Overview of your event management data.</p>
      {Array.isArray(dashboards) && dashboards.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No dashboard data available yet.</p>
      )}
    </div>
  );
}
