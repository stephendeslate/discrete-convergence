import { Badge } from './ui/badge';

interface Event {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
}

export function EventList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div>
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {new Date(event.startDate).toLocaleDateString()} -{' '}
              {new Date(event.endDate).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
