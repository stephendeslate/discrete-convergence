import { EventCard } from '@/components/ui/event-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function getPublicEvents(): Promise<Array<{
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  venue: { name: string; city: string } | null;
  ticketTypes: Array<{ price: number }>;
}>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/events/public`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error('Failed to load public events');
  }
  const body = await res.json();
  return body.data ?? [];
}

export default async function DiscoverPage() {
  const events = await getPublicEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Events</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Find upcoming events near you</p>
      </div>
      <div className="max-w-sm">
        <Label htmlFor="search">Search</Label>
        <Input id="search" name="search" placeholder="Search events..." />
      </div>
      {events.length === 0 ? (
        <p className="text-[var(--muted-foreground)] py-12 text-center">No public events available right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              status="PUBLISHED"
              date={new Date(event.startDate).toLocaleDateString()}
              venue={event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
