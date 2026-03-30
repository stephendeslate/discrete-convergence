import dynamic from 'next/dynamic';
import { Skeleton } from '../../components/ui/skeleton';

const EventList = dynamic(() => import('../../components/event-list'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Events</h1>
      <EventList />
    </div>
  );
}
