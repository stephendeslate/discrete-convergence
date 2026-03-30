// TRACED:EM-FE-005
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { AttendeeList } from '../../components/attendee-list';

export default async function AttendeesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let attendees: Array<{ id: string; name: string; email: string; checkedIn: boolean }> = [];
  try {
    const res = await apiClient<{ data: typeof attendees }>('/attendees', { token });
    attendees = res.data ?? [];
  } catch {
    attendees = [];
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Attendees</h1>
      <AttendeeList />
    </div>
  );
}
