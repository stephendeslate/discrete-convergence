import dynamic from 'next/dynamic';

const EventList = dynamic(() => import('../../components/event-list'), {
  loading: () => <div className="h-48 animate-pulse rounded bg-[var(--muted)]" />,
});

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-[var(--muted-foreground)]">
        Manage your events, registrations, and venues.
      </p>
      <EventList />
    </div>
  );
}
