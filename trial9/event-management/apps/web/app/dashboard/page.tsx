import dynamic from 'next/dynamic';
import { getEvents } from '../../lib/actions';
import { Skeleton } from '../../components/ui/skeleton';

const EventList = dynamic(
  () => import('../../components/event-list').then((mod) => ({ default: mod.EventList })),
  { loading: () => <Skeleton className="h-48 w-full" /> },
);

export default async function DashboardPage() {
  const data = await getEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Events</p>
          <p className="text-2xl font-bold">{data.total}</p>
        </div>
      </div>
      <EventList events={data.items} />
    </div>
  );
}
