import { getDashboard } from '@/lib/actions';

export default async function DashboardPage() {
  const data = await getDashboard();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold">Total Events</h2>
          <p className="text-2xl font-bold">{data.totalEvents ?? 0}</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold">Active Events</h2>
          <p className="text-2xl font-bold">{data.activeEvents ?? 0}</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold">Total Attendees</h2>
          <p className="text-2xl font-bold">{data.totalAttendees ?? 0}</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold">${data.totalRevenue ?? '0.00'}</p>
        </div>
      </div>
    </div>
  );
}
