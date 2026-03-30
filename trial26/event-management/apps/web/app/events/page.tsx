// TRACED:EM-FE-003
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { EventList } from '../../components/event-list';
import { CreateEventForm } from '../../components/create-event-form';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let events: Array<{ id: string; title: string; status: string; startDate: string; capacity: number }> = [];
  try {
    const res = await apiClient<{ data: typeof events }>('/events', { token });
    events = res.data ?? [];
  } catch {
    events = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Events</h1>
      </div>
      <CreateEventForm />
      <EventList events={events} />
    </div>
  );
}
