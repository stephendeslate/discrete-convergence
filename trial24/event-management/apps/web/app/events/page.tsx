// TRACED:WEB-EVENTS-PAGE
import { EventList } from '@/components/event-list';
import { CreateEventForm } from '@/components/create-event-form';

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      </div>
      <CreateEventForm />
      <EventList />
    </div>
  );
}
